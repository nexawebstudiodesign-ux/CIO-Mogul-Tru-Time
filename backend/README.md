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
JWT_SECRET="change-me"
JWT_EXPIRES_IN="12h"
ADMIN_SETUP_TOKEN=""
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
- Supabase tables use snake_case columns: `employee_id`, `leave_balance`, `is_active`, etc.
- Frontend currently uses mock data and does not call these APIs unless wired.
