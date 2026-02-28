# Bank Account Details Feature - Setup Guide

## Overview
Users can now add and manage their bank account details which will automatically appear on their salary slips.

## Database Migration

If you have an existing database, run this SQL in your Supabase SQL editor:

```sql
-- Add bank account columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_number text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ifsc_code text;
```

Or use the migration file:
```bash
# Run the migration SQL file
psql -h your-db-host -U postgres -d your-db-name -f backend/prisma/add-bank-details.sql
```

## Features

### For Users
1. Navigate to User Dashboard
2. Click on "Bank Details" tab
3. Click "Edit Details" button
4. Enter:
   - Bank Name (e.g., HDFC Bank, ICICI Bank)
   - Account Number
   - IFSC Code
5. Click "Save Changes"

### Salary Slip Integration
- Bank details automatically appear on salary slips
- If no bank details are provided, the section is hidden
- Details are displayed in a professional format

### API Endpoints
The existing `/users/:id` PATCH endpoint now accepts:
```json
{
  "bankName": "HDFC Bank",
  "accountNumber": "1234567890",
  "ifscCode": "HDFC0001234"
}
```

### Backend Changes
- `UpdateUserDto` already includes bank fields
- `UsersService.updateUser()` handles bank details
- `UsersService.getMe()` returns bank details

### Frontend Changes
- New "Bank Details" tab in User Dashboard
- Edit/View mode toggle
- Form validation and error handling
- Real-time updates to localStorage

## Testing

1. Login as a user
2. Go to User Dashboard
3. Click "Bank Details" tab
4. Add your bank information
5. Save and verify
6. Go to "Salary Slip" tab
7. Click "Open Printable Slip"
8. Verify bank details appear on the slip

## Security Notes
- Bank details are stored as plain text (consider encryption for production)
- Only the user can edit their own bank details
- Admin can also edit user bank details via user management
- Bank details are optional fields
