# CIO Mogul Tru Time - Frontend

## Overview
React + Tailwind dashboard for admin and user workflows. Includes month filters, compliance metrics, CSV export, and forms for attendance and leave. Current UI uses mock data (frontend-only CRUD).

## Routes
- `/` Welcome page
- `/dashboard` Admin dashboard (password gate)
- `/login` User login
- `/user` User dashboard

## Admin dashboard
- View all user records by month
- Click a user to see leaves + Tru Time records
- CSV export (monthly summary)
- Add/Edit/Delete users (frontend-only)
- Add/Edit/Delete leaves (frontend-only)
- Casual and Sick balances with monthly sick lapse

## User dashboard
- Enter daily Tru Time (login/logout + productivity fields)
- Apply for leave
- View monthly attendance and leave history

## Admin password
Set in `frontend/.env`:
```
VITE_DASHBOARD_PASSWORD=ciomogul
```

## Run locally
```
npm install
npm run dev
```

## Notes
- All form fields are required.
- Changes in the UI update immediately in the browser but are not persisted until API wiring is added.
