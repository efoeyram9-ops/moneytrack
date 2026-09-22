-- ============================================================================
-- MoneyTrack — OPTIONAL demo data
-- This is NOT run automatically. It never touches a real user's account by
-- default. To try it, replace :user_id below with your own auth.users id
-- (Dashboard -> Authentication -> Users) and run manually in the SQL editor.
-- ============================================================================

-- Example usage:
-- 1. Find your user id in Supabase Authentication tab.
-- 2. Replace 'YOUR-USER-UUID-HERE' everywhere below.
-- 3. Run this file in the SQL editor.

do $$
declare
  v_user uuid := 'YOUR-USER-UUID-HERE';
  v_food uuid;
  v_transport uuid;
  v_salary uuid;
begin
  select id into v_food from public.categories where user_id = v_user and name = 'Food' and type = 'expense';
  select id into v_transport from public.categories where user_id = v_user and name = 'Transport' and type = 'expense';
  select id into v_salary from public.categories where user_id = v_user and name = 'Salary' and type = 'income';

  insert into public.transactions (user_id, type, amount, category_id, description, payment_method, transaction_date)
  values
    (v_user, 'income', 4500.00, v_salary, 'Monthly salary', 'Bank', date_trunc('month', current_date)),
    (v_user, 'expense', 420.00, v_food, 'Groceries', 'MTN MoMo', current_date - interval '3 day'),
    (v_user, 'expense', 120.00, v_transport, 'Fuel', 'Cash', current_date - interval '5 day');

  insert into public.budgets (user_id, category_id, amount, month, year)
  values
    (v_user, v_food, 800.00, extract(month from current_date)::int, extract(year from current_date)::int),
    (v_user, v_transport, 500.00, extract(month from current_date)::int, extract(year from current_date)::int)
  on conflict do nothing;

  insert into public.savings_goals (user_id, name, target_amount, deadline, description)
  values (v_user, 'New Laptop', 8000.00, current_date + interval '90 day', 'Saving for a work laptop')
  returning id into v_food; -- reuse variable as scratch

  insert into public.savings_contributions (user_id, goal_id, amount, note)
  values (v_user, v_food, 3500.00, 'Initial contribution');
end $$;
