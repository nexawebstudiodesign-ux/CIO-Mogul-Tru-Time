-- Add unique constraint to prevent duplicate salary records for same user/month
-- This ensures data integrity at the database level

-- Unique salary per user per month
ALTER TABLE monthly_salaries 
ADD CONSTRAINT unique_user_month UNIQUE (user_id, month);

-- Check constraints for positive values and valid working days
ALTER TABLE monthly_salaries
ADD CONSTRAINT check_positive_salary_values
CHECK (
  base_salary >= 0 AND 
  hra >= 0 AND 
  transport_allowance >= 0 AND
  other_allowance >= 0 AND
  performance_bonus >= 0 AND
  pf_deduction >= 0 AND
  tax_deduction >= 0 AND
  other_deduction >= 0 AND
  working_days > 0 AND 
  working_days <= 31
);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT unique_user_month ON monthly_salaries IS 
'Prevents duplicate salary records for the same user in the same month. Users should edit existing records instead.';
