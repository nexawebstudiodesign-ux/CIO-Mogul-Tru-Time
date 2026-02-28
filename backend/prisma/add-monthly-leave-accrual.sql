alter table if exists public.users
  add column if not exists last_leave_accrual_month text not null default '';
