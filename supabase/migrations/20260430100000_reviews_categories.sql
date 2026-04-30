-- Multi-category ratings (run once in Supabase SQL editor).

alter table public.reviews add column if not exists food_stars integer;
alter table public.reviews add column if not exists service_stars integer;
alter table public.reviews add column if not exists atmosphere_stars integer;
alter table public.reviews add column if not exists overall_average numeric(4,2);
alter table public.reviews add column if not exists selected_template text;
alter table public.reviews add column if not exists feedback_food text default '' not null;
alter table public.reviews add column if not exists feedback_service text default '' not null;
alter table public.reviews add column if not exists feedback_atmosphere text default '' not null;
