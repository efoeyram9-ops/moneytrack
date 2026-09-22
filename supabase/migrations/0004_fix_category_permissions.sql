-- Allow authenticated users to create and manage their own categories.
alter table public.categories enable row level security;

drop policy if exists "Users can read visible categories" on public.categories;
create policy "Users can read visible categories"
  on public.categories for select
  using (user_id is null or user_id = auth.uid());

drop policy if exists "Users can create own categories" on public.categories;
create policy "Users can create own categories"
  on public.categories for insert
  with check (user_id = auth.uid());

drop policy if exists "Users can update own categories" on public.categories;
create policy "Users can update own categories"
  on public.categories for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete own categories" on public.categories;
create policy "Users can delete own categories"
  on public.categories for delete
  using (user_id = auth.uid());