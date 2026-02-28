-- Migration: Add bank account details to users table
-- Run this in Supabase SQL editor if bank columns don't exist

-- Add bank_name column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'bank_name'
  ) THEN
    ALTER TABLE public.users ADD COLUMN bank_name text;
  END IF;
END $$;

-- Add account_number column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'account_number'
  ) THEN
    ALTER TABLE public.users ADD COLUMN account_number text;
  END IF;
END $$;

-- Add ifsc_code column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'ifsc_code'
  ) THEN
    ALTER TABLE public.users ADD COLUMN ifsc_code text;
  END IF;
END $$;
