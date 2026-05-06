-- Allow signed-in users to insert their own profile row (required for upsert from the app).
drop policy if exists "profiles_insert_own" on public.profiles;

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);
