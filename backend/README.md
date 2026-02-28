# CIO Mogul Tru Time - Backend

## Overview
NestJS API for attendance, productivity, leave management, and admin/user access. Uses Supabase directly (no Prisma). JWT authentication and role-based guards are in place.

## Features
- Admin login, admin signup (one-time)
- User management: create, edit, delete, reset password
- Attendance: create daily entry, list all, list self
- Leave: apply, approve/reject, admin create/edit/delete
- Role-based protection for admin vs user endpoints

## Environment
Create a `.env` file in `backend/` using:

```
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
SUPABASE_ANON_KEY="YOUR_ANON_KEY"
SUPABASE_JWT_SECRET="YOUR_JWT_SECRET"
ADMIN_SETUP_TOKEN=""
ADMIN_DASHBOARD_EMAIL="mudholkishor@gmail.com"
ADMIN_DASHBOARD_PASSWORD="CIO@#2026"
```

## Run locally
```
npm install
npm run start:dev
```

## Main API Routes
Auth
- POST `/auth/login`
- POST `/auth/admin-signup`

Users (admin only)
- POST `/users`
- GET `/users`
- PATCH `/users/:id`
- DELETE `/users/:id`
- PATCH `/users/:id/leave-balance`
- POST `/users/:id/reset-password`
- GET `/users/me`

Attendance
- POST `/attendance` (user)
- GET `/attendance` (admin)
- GET `/attendance/me` (user)

Leave
- POST `/leave` (user)
- GET `/leave/me` (user)
- GET `/leave` (admin)
- POST `/leave/admin` (admin)
- PATCH `/leave/:id` (admin)
- PATCH `/leave/:id/status` (admin)
- DELETE `/leave/:id` (admin)

## Notes
- Supabase tables use snake_case columns: `employee_id`, `casual_balance`, `sick_balance`, `is_active`, etc.
- Users table includes default salary fields: `base_salary`, `hra`, `transport_allowance`, `other_allowance`, `pf_deduction`, `tax_deduction`, `other_deduction`
- Monthly salaries tracked in `monthly_salaries` table with month-specific values and `performance_bonus`
- Admin can set different salary amounts each month with optional performance bonus
- Frontend currently uses mock data and does not call these APIs unless wired.
