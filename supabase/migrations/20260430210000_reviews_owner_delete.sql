-- Allow venue owners to delete feedback for their own restaurants only
drop policy if exists "reviews_delete_owner" on public.reviews;

create policy "reviews_delete_owner"
  on public.reviews for delete
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = reviews.restaurant_id and r.owner_id = auth.uid()
    )
  );
