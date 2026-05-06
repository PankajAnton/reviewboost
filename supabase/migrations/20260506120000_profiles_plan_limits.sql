-- Subscription plans, restaurant limits, and enforcement

alter table public.profiles
  add column if not exists plan_type text;

alter table public.profiles
  add column if not exists restaurant_limit integer;

alter table public.profiles
  add column if not exists subscription_status text;

alter table public.profiles
  add column if not exists subscription_end_date timestamptz;

-- Defaults for new rows (existing NULLs backfilled below)
alter table public.profiles
  alter column plan_type set default 'trial';

alter table public.profiles
  alter column restaurant_limit set default 1;

alter table public.profiles
  alter column subscription_status set default 'trial';

update public.profiles
set
  plan_type = coalesce(plan_type, 'trial'),
  restaurant_limit = coalesce(restaurant_limit, 1),
  subscription_status = coalesce(subscription_status, 'trial');

alter table public.profiles
  alter column plan_type set not null;

alter table public.profiles
  alter column restaurant_limit set not null;

alter table public.profiles
  alter column subscription_status set not null;

alter table public.profiles
  drop constraint if exists profiles_plan_type_check;

alter table public.profiles
  add constraint profiles_plan_type_check
    check (plan_type in ('trial', 'starter', 'growth'));

alter table public.profiles
  drop constraint if exists profiles_restaurant_limit_check;

alter table public.profiles
  add constraint profiles_restaurant_limit_check
    check (restaurant_limit in (1, 3, 10));

-- Trial end for accounts that never had a paid subscription window set
update public.profiles
set subscription_end_date = now() + interval '30 days'
where subscription_end_date is null
  and plan_type = 'trial'
  and subscription_status = 'trial';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    plan_type,
    restaurant_limit,
    subscription_status,
    subscription_end_date
  )
  values (
    new.id,
    new.email,
    'trial',
    1,
    'trial',
    now() + interval '30 days'
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create or replace function public.enforce_owner_restaurant_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  lim integer;
  cnt integer;
begin
  select coalesce(p.restaurant_limit, 1)
    into lim
  from public.profiles p
  where p.id = new.owner_id;

  if lim is null then
    lim := 1;
  end if;

  select count(*)::integer
    into cnt
  from public.restaurants
  where owner_id = new.owner_id;

  if cnt >= lim then
    raise exception 'RESTAURANT_LIMIT_REACHED'
      using hint = 'Upgrade your plan for more venues.';
  end if;

  return new;
end;
$$;

drop trigger if exists restaurants_enforce_limit_before_insert on public.restaurants;

create trigger restaurants_enforce_limit_before_insert
  before insert on public.restaurants
  for each row
  execute function public.enforce_owner_restaurant_limit();
