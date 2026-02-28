# 🎯 CIO Mogul Tru Time

> Enterprise-grade attendance, productivity, and leave management system with admin and user dashboards.

**Organization:** CIO MOGUL GLOBAL PUBLICATION PRIVATE LIMITED  
**UAN:** U58132MH2025PTC459494  
**Address:** Sno. 80/1 Sai Nagari Bld, B/iwadmukhwadi Bhosari, Punawale, Pune, Pune City, Maharashtra, India, 411033

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NestJS](https://img.shields.io/badge/NestJS-11.0.1-E0234E?logo=nestjs)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)

## 📋 Table of Contents
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Validation Rules](#-validation-rules-implemented)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Known Issues](#-known-issues--improvements-needed)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🛠 Tech Stack
- **Backend**: NestJS 11.0.1 + Supabase (REST API, JWT auth)
- **Frontend**: React 19.0.0 + Vite 6.0 + Tailwind CSS 3.4
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: JWT tokens + bcryptjs password hashing
- **Deployment**: Vercel (frontend), Render/Railway (backend)
- **Email**: info@theciomogul.com (admin contact)

---

## Quick Start

### 1. Supabase Setup
Create a new project in [Supabase](https://supabase.com), then run this SQL in the SQL editor:

```sql
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

-- RLS
alter table public.users enable row level security;
alter table public.attendance enable row level security;
alter table public.leaves enable row level security;
alter table public.monthly_salaries enable row level security;

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
```

Copy your **Project URL** and **service_role key** from Settings → API.

---

### 2. Backend Setup (NestJS)
```bash
cd backend
npm install
```

Create `backend/.env`:
```
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
SUPABASE_ANON_KEY="YOUR_ANON_KEY"
SUPABASE_JWT_SECRET="YOUR_JWT_SECRET"
ADMIN_SETUP_TOKEN=""
ADMIN_DASHBOARD_EMAIL="mudholkishor@gmail.com"
ADMIN_DASHBOARD_PASSWORD="CIO@#2026"
```

Run locally:
```bash
npm run start:dev
```

---

### 3. Frontend Setup (React)
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_DASHBOARD_PASSWORD=ciomogul
VITE_API_URL=http://localhost:3000
```

Run locally:
```bash
npm run dev
```

Open:
- Admin: http://localhost:5173/dashboard (password: `ciomogul`)
- User login: http://localhost:5173/login

---

## ✨ Features

### 👨‍💼 Admin Dashboard
- **User Management**
  - Create/Edit/Delete users with role-based access
  - Generate auto-incremented Employee IDs (CIO-0001, CIO-0002, etc.)
  - Manage leave balances (Casual/Sick leave)
  - Reset user passwords
  - Activate/Deactivate users

- **Attendance Oversight**
  - View all employee attendance records by month
  - Track compliance (9+ hour days)
  - Monitor productivity metrics (mails, data, LinkedIn, follow-ups)
  - Filter by user and date range
  - Export monthly summary to CSV

- **Leave Management**
  - Approve/Reject leave requests
  - Create leaves on behalf of users
  - Track leave status (PENDING/APPROVED/REJECTED)
  - View leave history with date ranges
  - Automatic balance deduction on leave application

- **Salary Administration**
  - Set monthly salary for each user
  - Configure components: Base, HRA, Transport, Other Allowances
  - Add performance bonuses
  - Set deductions: PF, Tax, Other
  - Current month + next month only (prevents far-future salary creation)
  - Duplicate prevention (one record per user per month)
  - Edit existing salary records instead of creating duplicates

### 👤 User Dashboard
- **Tru Time Entry**
  - Daily attendance submission with login/logout times
  - Productivity tracking (mails sent, data processed, LinkedIn outreach, follow-ups)
  - Working hours calculation (must be 4-16 hours)
  - Cannot mark for future dates, weekends, or holidays
  - Maximum 7 days retroactive entry
  - Real-time validation with user-friendly error messages

- **Leave Application**
  - Apply for Casual, Sick, or Paid leave
  - Immediate balance deduction (not deferred to approval)
  - Current month + next month restriction only
  - Cannot apply for dates older than 7 days
  - Overlap detection (prevents duplicate leave periods)
  - Minimum 10-character reason requirement
  - Real-time balance validation before submission
  - **Cancel Leave**: Users can cancel their own leaves until end date passes

- **Self-Service Features**
  - View monthly attendance history
  - Track leave balance in real-time
  - View leave status (PENDING/APPROVED/REJECTED)
  - Generate and print salary slips (PDF-ready)
  - Month-wise salary slip selection
  - Contact admin help: info@theciomogul.com

### 🔐 Authentication & Security
- JWT-based authentication with role guards
- Role-based access control (ADMIN vs USER)
- Bcrypt password hashing
- Protected routes with middleware
- Supabase RLS policies (service role only)
- Auto-logout on token expiration

### 🎨 UI/UX Features
- Modern glass-morphism design with Tailwind CSS
- Responsive layout (desktop-first)
- Real-time form validation with error messages
- Character counters for text inputs
- Disabled/enabled states for action buttons
- Loading states for async operations
- Success/Error notifications
- Professional color scheme (Sand/Ink palette)

---

## Deployment

### Backend (Render/Railway)
1. Connect your repo
2. Set environment variables (see backend `.env` example)
3. Build: `npm install && npm run build`
4. Start: `npm run start:prod`

### Frontend (Vercel)
1. Import `frontend/` folder
2. Add env vars:
   - `VITE_DASHBOARD_PASSWORD`
   - `VITE_API_URL` (your backend URL)
3. Build: `npm run build`
4. Output: `dist`

---

## Database Schema

### users
- `id` (uuid, PK)
- `employee_id` (text, unique, e.g., `CIO-0001`)
- `name`, `email`, `password_hash`
- `role` (ADMIN | USER)
- `casual_balance` (0–12)
- `sick_balance` (0–12)
- `sick_base_month` (date)
- `base_salary`, `hra`, `transport_allowance`, `other_allowance` (numeric)
- `pf_deduction`, `tax_deduction`, `other_deduction` (numeric)
- `is_active` (boolean)

### attendance
- `id` (uuid, PK)
- `user_id` (uuid, FK → users)
- `date`, `login_time`, `logout_time`, `total_minutes`
- `mails_count`, `data_count`, `linkedin_count`, `follow_up_count`

### leaves

### monthly_salaries
- `id` (uuid, PK)
- `user_id` (uuid, FK → users)
- `month` (date, unique per user)
- `base_salary`, `hra`, `transport_allowance`, `other_allowance`, `performance_bonus` (numeric)
- `pf_deduction`, `tax_deduction`, `other_deduction` (numeric)
- `id` (uuid, PK)
- `user_id` (uuid, FK → users)
- `leave_type` (CASUAL | SICK | PAID)
- `from_date`, `to_date`, `reason`
- `status` (PENDING | APPROVED | REJECTED)

---

## Notes
- Frontend currently uses mock data; wire `VITE_API_URL` to connect to backend.
- Supabase RLS policies allow only service_role access (backend uses service key).
- All form fields are required in the UI.
- Users can select any month to view their salary slip:
  - If admin has set month-specific salary, shows that data
  - Otherwise, shows default salary structure from user profile
  - If no salary data exists at all, displays "No Salary Data" message
  - Performance metrics calculated from attendance records for selected month

---

## License
MIT
