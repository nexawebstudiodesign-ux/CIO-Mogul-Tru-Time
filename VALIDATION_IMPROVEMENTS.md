# Real-Time Employee Management System - Validation Improvements

## Current Status ✅

### What's Working Well:
1. ✅ **Leave Balance Validation** - Checks sufficient balance before approval
2. ✅ **Duplicate Attendance Prevention** - One entry per user per day
3. ✅ **Date Range Validation** - To date must be after from date
4. ✅ **Time Validation** - Logout must be after login
5. ✅ **Email Uniqueness** - Prevents duplicate emails
6. ✅ **Password Security** - Minimum 6 characters
7. ✅ **Leave Balance Adjustment** - Auto-adjusts on approval/rejection

---

## Critical Missing Validations for Real-Time Processing

### 🔴 HIGH PRIORITY

#### 1. **Attendance Date Restrictions**
**Current Issue:** Users can mark attendance for any date (past/future)
**Risk:** Data manipulation, false records

**Required Rules:**
- ❌ Cannot mark attendance for future dates
- ❌ Cannot mark attendance older than 7 days (configurable)
- ❌ Cannot mark attendance for non-working days (weekends/holidays)
- ❌ Should validate login time is not before 6 AM or after 11 AM
- ❌ Should validate logout time is not after midnight

#### 2. **Overlapping Leave Validation**
**Current Issue:** Users can apply for overlapping leave periods
**Risk:** Double leave claims, balance manipulation

**Required Rules:**
- ❌ Check for existing approved/pending leaves in the same date range
- ❌ Prevent leave application if attendance already marked for those dates
- ❌ Block leave approval if attendance exists in that period

#### 3. **Leave Balance Before Application**
**Current Issue:** Users can apply for leave without sufficient balance
**Risk:** Approved leaves with negative balance

**Required Rules:**
- ❌ Check leave balance before allowing application (frontend shows, backend should enforce)
- ❌ Different balance types for CASUAL, SICK, PAID leaves
- ❌ Maximum consecutive leave days limit (e.g., max 5 days at once)

#### 4. **Salary Month Duplication**
**Current Issue:** Can create multiple salary records for same user/month
**Risk:** Duplicate salary payments

**Required Rules:**
- ❌ Unique constraint on (user_id + month)
- ❌ Prevent salary creation for future months beyond next month
- ❌ Validate salary month is not older than 12 months

#### 5. **Working Hours Validation**
**Current Issue:** Can submit unrealistic working hours
**Risk:** False overtime claims, data integrity issues

**Required Rules:**
- ❌ Minimum working hours: 4 hours
- ❌ Maximum working hours: 16 hours per day
- ❌ Break time validation (if logout-login > 12 hours, flag for review)

---

### 🟡 MEDIUM PRIORITY

#### 6. **Name Format Validation**
**Current Issue:** No name format rules
**Required Rules:**
- ❌ Minimum 2 characters, maximum 50
- ❌ Only alphabets and spaces
- ❌ No special characters or numbers

#### 7. **Leave Reason Validation**
**Current Issue:** Can submit very short or empty reasons
**Required Rules:**
- ❌ Minimum 10 characters for leave reason
- ❌ Maximum 500 characters
- ❌ No profanity or inappropriate content

#### 8. **Status Transition Validation**
**Current Issue:** Any status can change to any status
**Required Rules:**
- ❌ PENDING → APPROVED/REJECTED (valid)
- ❌ APPROVED → REJECTED (should be restricted)
- ❌ REJECTED → APPROVED (requires special approval)
- ❌ Cannot change status if leave date has passed

#### 9. **Email Domain Validation**
**Current Issue:** Any email format accepted
**Required Rules:**
- ❌ Company domain only (e.g., @company.com) OR
- ❌ Whitelist of allowed domains
- ❌ Block disposable email providers

#### 10. **Performance Metrics Validation**
**Current Issue:** Can input any number for mails/data/linkedin counts
**Required Rules:**
- ❌ Maximum realistic limits (e.g., max 500 mails/day)
- ❌ All counts must be non-negative
- ❌ Flag unusually high numbers for admin review

---

### 🟢 LOW PRIORITY (Enhancements)

#### 11. **Password Strength**
- ❌ Require at least 1 uppercase letter
- ❌ Require at least 1 number
- ❌ Require at least 1 special character
- ❌ Minimum 8 characters (currently 6)

#### 12. **Phone Number Validation** (if added to user profile)
- ❌ Valid phone format with country code
- ❌ 10-15 digits only

#### 13. **Leave Application Advance Notice**
- ❌ Must apply at least 1 day in advance (except sick leave)
- ❌ Sick leave can be same-day or retroactive (with proof)

#### 14. **Salary Calculation Validation**
- ❌ Total allowances cannot exceed base salary by 100%
- ❌ Total deductions cannot exceed gross salary
- ❌ Net salary must be positive after deductions

#### 15. **Concurrency Control**
- ❌ Prevent race conditions when multiple admins approve same leave
- ❌ Optimistic locking for leave balance updates

---

## Implementation Priority

### Phase 1 - Critical (Implement Immediately)
1. Attendance date restrictions (no future dates, max 7 days old)
2. Overlapping leave validation
3. Salary month duplication check
4. Working hours min/max validation

### Phase 2 - Important (Next Sprint)
1. Leave balance check before application
2. Status transition rules
3. Name format validation
4. Leave reason length validation

### Phase 3 - Nice to Have (Future Enhancement)
1. Email domain whitelist
2. Password strength improvements
3. Performance metrics limits
4. Leave advance notice rules

---

## Additional Real-Time System Requirements

### API Rate Limiting
- ❌ Implement rate limiting to prevent abuse
- ❌ Max 100 requests per minute per user
- ❌ Max 10 login attempts per hour

### Audit Logging
- ❌ Log all CRUD operations with timestamp and user
- ❌ Track who approved/rejected leaves
- ❌ Track salary modifications

### Data Consistency
- ❌ Database transactions for leave approval (balance update + status change)
- ❌ Rollback mechanism if any operation fails
- ❌ Database constraints (unique, foreign key, check constraints)

### Real-Time Notifications (Future)
- ❌ Email notification on leave approval/rejection
- ❌ Admin notification when leave applied
- ❌ Salary slip generation notification

### Security Enhancements
- ❌ JWT token expiration (currently set, but needs refresh token)
- ❌ Prevent SQL injection (Supabase handles this)
- ❌ Input sanitization for XSS prevention
- ❌ CORS configuration for production only

---

## Database Constraints to Add

```sql
-- Unique salary per user per month
ALTER TABLE monthly_salaries 
ADD CONSTRAINT unique_user_month UNIQUE (user_id, month);

-- Unique attendance per user per date (already exists via duplicate check)
ALTER TABLE attendance 
ADD CONSTRAINT unique_user_date UNIQUE (user_id, date);

-- Check constraints for working hours (4-16 hours)
ALTER TABLE attendance 
ADD CONSTRAINT check_working_hours 
CHECK (total_minutes >= 240 AND total_minutes <= 960);

-- Check constraints for salary calculations
ALTER TABLE monthly_salaries
ADD CONSTRAINT check_positive_values
CHECK (base_salary >= 0 AND hra >= 0 AND working_days > 0 AND working_days <= 31);

-- Check constraint for leave balance
ALTER TABLE users
ADD CONSTRAINT check_leave_balance
CHECK (leave_balance >= 0 AND leave_balance <= 12);
```

---

## Testing Requirements

### Unit Tests Needed
- [ ] Test leave overlap detection
- [ ] Test attendance date restrictions
- [ ] Test working hours validation
- [ ] Test salary month uniqueness
- [ ] Test status transition rules

### Integration Tests Needed
- [ ] Test leave application → approval → balance deduction flow
- [ ] Test concurrent leave approvals
- [ ] Test attendance + leave conflict detection

### Load Tests Needed
- [ ] Test with 100+ concurrent users
- [ ] Test API response time under load
- [ ] Test database query performance

---

## Conclusion

**Estimated Implementation Time:**
- Phase 1 (Critical): 2-3 days
- Phase 2 (Important): 2 days
- Phase 3 (Nice to Have): 1-2 days

**Total Effort:** ~5-7 days for complete validation coverage

**Recommendation:** Implement Phase 1 immediately to prevent data integrity issues in production.
