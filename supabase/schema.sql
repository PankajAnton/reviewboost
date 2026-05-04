-- ReviewBoost — run this SQL in Supabase SQL Editor after creating a project
-- TODO: Adjust RLS if you need stricter rules

-- Restaurants owned by authenticated users
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  google_maps_link text not null,
  created_at timestamptz not null default now()
);

-- Customer feedback / review intents
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  stars integer not null check (stars >= 1 and stars <= 5),
  feedback text not null default '',
  food_stars integer check (food_stars is null or (food_stars >= 1 and food_stars <= 5)),
  service_stars integer check (service_stars is null or (service_stars >= 1 and service_stars <= 5)),
  atmosphere_stars integer check (atmosphere_stars is null or (atmosphere_stars >= 1 and atmosphere_stars <= 5)),
  overall_average numeric(4,2),
  selected_template text,
  feedback_food text not null default '',
  feedback_service text not null default '',
  feedback_atmosphere text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_restaurants_owner on public.restaurants (owner_id);
create index if not exists idx_reviews_restaurant on public.reviews (restaurant_id);

alter table public.restaurants enable row level security;
alter table public.reviews enable row level security;

-- Anyone can read a restaurant row (needed for public /r/:id page)
create policy "restaurants_select_public"
  on public.restaurants for select
  using (true);

-- Owners full CRUD on their restaurants
create policy "restaurants_insert_owner"
  on public.restaurants for insert
  with check (auth.uid() = owner_id);

create policy "restaurants_update_owner"
  on public.restaurants for update
  using (auth.uid() = owner_id);

create policy "restaurants_delete_owner"
  on public.restaurants for delete
  using (auth.uid() = owner_id);

-- Public can leave feedback (anon or logged-in customers)
create policy "reviews_insert_public"
  on public.reviews for insert
  with check (true);

-- Owners read reviews for their venues only
create policy "reviews_select_owner"
  on public.reviews for select
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = reviews.restaurant_id and r.owner_id = auth.uid()
    )
  );

-- Owners can delete feedback for their venues only (dashboard)
create policy "reviews_delete_owner"
  on public.reviews for delete
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = reviews.restaurant_id and r.owner_id = auth.uid()
    )
  );

-- Owner profile (email synced from auth.users for server-side alerts)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  restaurant_name text,
  plan text not null default 'free'
);

create index if not exists idx_profiles_email on public.profiles (email);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_auth_user_email_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles
    set email = new.email
    where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_auth_user_email_update();

insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do update set email = excluded.email;
