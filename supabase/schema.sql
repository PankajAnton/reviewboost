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
