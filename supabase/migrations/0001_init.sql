-- =========================================================
-- MoneyTrack initial schema
-- Run this entire file in the Supabase SQL Editor.
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  currency text not null default 'GHS',
  currency_symbol text not null default 'GH₵',
  date_format text not null default 'dd/MM/yyyy'
    check (date_format in ('dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd')),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 2. categories
--    user_id is NULL for global default categories (visible to everyone)
-- ---------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text not null default 'Wallet',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  constraint categories_name_not_blank check (btrim(name) <> '')
);

create unique index if not exists categories_user_name_type_idx
  on public.categories (coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name), type);

create index if not exists categories_user_id_idx on public.categories (user_id);
create index if not exists categories_type_idx on public.categories (type);

-- ---------------------------------------------------------
-- 3. transactions
-- ---------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount > 0),
  category_id uuid references public.categories (id) on delete set null,
  description text,
  payment_method text not null,
  transaction_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists transactions_date_idx on public.transactions (transaction_date);
create index if not exists transactions_user_date_idx on public.transactions (user_id, transaction_date desc);
create index if not exists transactions_category_idx on public.transactions (category_id);
create index if not exists transactions_type_idx on public.transactions (type);

-- ---------------------------------------------------------
-- 4. budgets
-- ---------------------------------------------------------
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  month smallint not null check (month between 1 and 12),
  year smallint not null check (year between 2000 and 2100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category_id, month, year)
);

create index if not exists budgets_user_id_idx on public.budgets (user_id);
create index if not exists budgets_period_idx on public.budgets (user_id, year, month);

-- ---------------------------------------------------------
-- 5. savings_goals
-- ---------------------------------------------------------
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  deadline date,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint savings_goals_name_not_blank check (btrim(name) <> '')
);

create index if not exists savings_goals_user_id_idx on public.savings_goals (user_id);

create table if not exists public.savings_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_id uuid not null references public.savings_goals (id) on delete cascade,
  amount numeric(12, 2) not null check (amount <> 0),
  note text,
  contribution_date date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists savings_contributions_goal_idx on public.savings_contributions (goal_id);
create index if not exists savings_contributions_goal_id_idx on public.savings_contributions (goal_id);
create index if not exists savings_contributions_user_id_idx on public.savings_contributions (user_id);

-- Category access: users can manage their own categories and read defaults.
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

-- =========================================================
-- Triggers
-- =========================================================

-- updated_at maintenance
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.transactions;
create trigger set_updated_at before update on public.transactions
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.budgets;
create trigger set_updated_at before update on public.budgets
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.savings_goals;
create trigger set_updated_at before update on public.savings_goals
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prevent deleting a category that still has transactions or budgets attached,
-- UNLESS the caller explicitly reassigns/deactivates first. Frontend guides users
-- to reassign transactions before deletion; this trigger is a hard safety net.
create or replace function public.prevent_category_delete_if_in_use()
returns trigger as $$
begin
  if exists (select 1 from public.transactions where category_id = old.id) then
    raise exception 'Cannot delete category "%" because transactions still use it. Reassign or delete those transactions first.', old.name
      using errcode = '23503';
  end if;
  if exists (select 1 from public.budgets where category_id = old.id) then
    raise exception 'Cannot delete category "%" because budgets still use it. Delete those budgets first.', old.name
      using errcode = '23503';
  end if;
  return old;
end;
$$ language plpgsql;

drop trigger if exists prevent_category_delete_if_in_use on public.categories;
create trigger prevent_category_delete_if_in_use before delete on public.categories
  for each row execute function public.prevent_category_delete_if_in_use();
