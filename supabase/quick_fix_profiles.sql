-- ReviewBoost — quick fix when Dashboard warns that `public.profiles` is missing
-- Paste ALL of this in Supabase → SQL Editor → Run once, then reload the app.
-- Safe to re-run (idempotent-ish).
-- Requires `public.restaurants` to exist (run full supabase/schema.sql first if you have no tables yet).

-- 1) Shell table (no-op if already fully migrated)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text,
  restaurant_name text
);

-- 2) Subscription columns (legacy tables may only have `plan`)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_type text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS restaurant_limit integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_end_date timestamptz;

ALTER TABLE public.profiles ALTER COLUMN plan_type SET DEFAULT 'trial';
ALTER TABLE public.profiles ALTER COLUMN restaurant_limit SET DEFAULT 1;
ALTER TABLE public.profiles ALTER COLUMN subscription_status SET DEFAULT 'trial';

UPDATE public.profiles
SET
  plan_type = coalesce(plan_type, 'trial'),
  restaurant_limit = coalesce(restaurant_limit, 1),
  subscription_status = coalesce(subscription_status, 'trial');

ALTER TABLE public.profiles ALTER COLUMN plan_type SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN restaurant_limit SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN subscription_status SET NOT NULL;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_type_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_type_check
  CHECK (plan_type IN ('trial', 'starter', 'growth'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_restaurant_limit_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_restaurant_limit_check
  CHECK (restaurant_limit IN (1, 3, 10));

UPDATE public.profiles
SET subscription_end_date = now() + interval '30 days'
WHERE subscription_end_date IS NULL
  AND plan_type = 'trial'
  AND subscription_status = 'trial';

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3) Auth sync + restaurant limit trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    plan_type,
    restaurant_limit,
    subscription_status,
    subscription_end_date
  )
  VALUES (
    new.id,
    new.email,
    'trial',
    1,
    'trial',
    now() + interval '30 days'
  )
  ON CONFLICT (id) DO UPDATE SET email = excluded.email;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_auth_user_email_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF new.email IS DISTINCT FROM old.email THEN
    UPDATE public.profiles SET email = new.email WHERE id = new.id;
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_email_update();

CREATE OR REPLACE FUNCTION public.enforce_owner_restaurant_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lim integer;
  cnt integer;
BEGIN
  SELECT coalesce(p.restaurant_limit, 1)
    INTO lim
  FROM public.profiles p
  WHERE p.id = new.owner_id;

  IF lim IS NULL THEN
    lim := 1;
  END IF;

  SELECT count(*)::integer
    INTO cnt
  FROM public.restaurants
  WHERE owner_id = new.owner_id;

  IF cnt >= lim THEN
    RAISE EXCEPTION 'RESTAURANT_LIMIT_REACHED'
      USING HINT = 'Upgrade your plan for more venues.';
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS restaurants_enforce_limit_before_insert ON public.restaurants;
CREATE TRIGGER restaurants_enforce_limit_before_insert
  BEFORE INSERT ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.enforce_owner_restaurant_limit();

-- 4) Backfill existing accounts
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO UPDATE SET email = excluded.email;
