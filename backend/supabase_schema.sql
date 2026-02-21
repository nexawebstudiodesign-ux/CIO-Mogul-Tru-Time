-- Extensions
create extension if not exists "pgcrypto";

-- Users
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  employee_id text not null unique,
  password_hash text not null,
  role text not null default 'USER' check (role in ('ADMIN', 'USER')),
  casual_balance int not null default 12 check (casual_balance between 0 and 12),
  sick_balance int not null default 12 check (sick_balance between 0 and 12),
  sick_base_month date not null default date_trunc('month', now())::date,
  base_salary numeric(10,2) not null default 0,
  hra numeric(10,2) not null default 0,
  transport_allowance numeric(10,2) not null default 0,
  other_allowance numeric(10,2) not null default 0,
  pf_deduction numeric(10,2) not null default 0,
  tax_deduction numeric(10,2) not null default 0,
  other_deduction numeric(10,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_employee_id_idx on public.users (employee_id);

-- Attendance
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  login_time time not null,
  logout_time time not null,
  total_minutes int not null,
  mails_count int not null default 0,
  data_count int not null default 0,
  linkedin_count int not null default 0,
  follow_up_count int not null default 0,
  created_at timestamptz not null default now(),
  constraint attendance_unique_user_date unique (user_id, date)
);

create index if not exists attendance_user_id_idx on public.attendance (user_id);
create index if not exists attendance_date_idx on public.attendance (date);

-- Leaves
create table if not exists public.leaves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  leave_type text not null check (leave_type in ('CASUAL', 'SICK', 'PAID')),
  from_date date not null,
  to_date date not null,
  reason text not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamptz not null default now()
);

create index if not exists leaves_user_id_idx on public.leaves (user_id);
create index if not exists leaves_status_idx on public.leaves (status);

-- Monthly Salaries
create table if not exists public.monthly_salaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  month date not null,
  base_salary numeric(10,2) not null default 0,
  hra numeric(10,2) not null default 0,
  transport_allowance numeric(10,2) not null default 0,
  other_allowance numeric(10,2) not null default 0,
  performance_bonus numeric(10,2) not null default 0,
  pf_deduction numeric(10,2) not null default 0,
  tax_deduction numeric(10,2) not null default 0,
  other_deduction numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monthly_salaries_unique_user_month unique (user_id, month)
);

create index if not exists monthly_salaries_user_id_idx on public.monthly_salaries (user_id);
create index if not exists monthly_salaries_month_idx on public.monthly_salaries (month);

-- Public Holidays
create table if not exists public.public_holidays (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

create index if not exists public_holidays_date_idx on public.public_holidays (date);

-- RLS
alter table public.users enable row level security;
alter table public.attendance enable row level security;
alter table public.leaves enable row level security;
alter table public.monthly_salaries enable row level security;
alter table public.public_holidays enable row level security;

-- Service role bypasses RLS
create policy "users_service_role" on public.users
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "attendance_service_role" on public.attendance
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "leaves_service_role" on public.leaves
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "monthly_salaries_service_role" on public.monthly_salaries
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "public_holidays_service_role" on public.public_holidays
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
