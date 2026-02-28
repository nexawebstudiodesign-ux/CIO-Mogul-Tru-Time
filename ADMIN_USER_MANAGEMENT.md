# Admin User Management Enhancement

## ✅ Features Added

### 1. Bank Details Management by Admin
**What**: Admin can add/edit user bank details during user creation or editing

**Fields**:
- Bank Name (optional)
- Account Number (optional)
- IFSC Code (optional)

**Behavior**:
- Can be skipped during user creation
- Can be added/updated later via Edit User
- Saved to database and displayed on salary slips

---

### 2. Password Visibility for Admin
**What**: Admin can see and edit the password they set for users

**Features**:
- **Create Mode**: Admin enters password (minimum 6 characters)
- **Edit Mode**: Password field shows current password set by admin
- **Update**: Admin can change password by editing the field
- **Storage**: Plain text password stored in `admin_password` column for admin reference

**Security Note**: 
- Password is hashed in `password_hash` for authentication
- Plain password in `admin_password` is for admin management only
- Users never see this field

---

## 🔧 Technical Implementation

### Database Changes
**Column**: `admin_password` (text, nullable)
- Already exists in schema
- Stores plain text password for admin viewing
- Updated on user creation and password reset

### Backend Changes
**File**: `backend/src/users/users.service.ts`

**Changes**:
1. Store `admin_password` on user creation
2. Return `admin_password` in listUsers()
3. Return `admin_password` in updateUser()
4. Update `admin_password` on resetPassword()

### Frontend Changes
**File**: `frontend/src/components/AdminDashboard.jsx`

**Changes**:
1. Added bank fields to userForm state
2. Load `adminPassword` when editing user
3. Changed password input type from `password` to `text` (shows password)
4. Save bank details on user update
5. Store `adminPassword` in local state after create/update

---

## 📋 User Flow

### Creating New User:
1. Admin fills: Name, Email, Password, Leave Balances
2. Admin optionally fills: Bank Name, Account Number, IFSC Code
3. Click "Save"
4. Password stored in both `password_hash` (hashed) and `admin_password` (plain)
5. Bank details saved if provided

### Editing Existing User:
1. Admin clicks "Edit" on user
2. Form shows all current details including:
   - Current password (visible in text field)
   - Current bank details (if set)
3. Admin can:
   - Change password (type new password)
   - Update bank details
   - Keep password as-is (don't change field)
4. Click "Save"
5. If password changed: Both `password_hash` and `admin_password` updated
6. Bank details updated

---

## 🎯 Use Cases

### Scenario 1: Create User Without Bank Details
```
1. Admin creates user with basic info + password
2. Skips bank fields (leaves empty)
3. User created successfully
4. Later, admin edits user and adds bank details
```

### Scenario 2: View User Password
```
1. User forgets password
2. Admin clicks "Edit" on user
3. Password field shows current password
4. Admin shares password with user
```

### Scenario 3: Change User Password
```
1. Admin clicks "Edit" on user
2. Sees current password in field
3. Types new password
4. Clicks "Save"
5. New password saved and shown on next edit
```

---

## 🔒 Security Considerations

### Password Storage:
- **Hashed**: `password_hash` column (bcrypt) - used for authentication
- **Plain**: `admin_password` column - used for admin reference only

### Access Control:
- Only ADMIN role can view/edit user passwords
- Users never see `admin_password` field
- Backend validates admin role before returning sensitive data

### Best Practices:
- Admin should use strong passwords
- Consider password rotation policy
- Educate users to change password after first login (future enhancement)

---

## ✅ Testing Checklist

### Create User:
- [ ] Can create user with bank details
- [ ] Can create user without bank details (skip fields)
- [ ] Password is visible in text field
- [ ] Password saved correctly

### Edit User:
- [ ] Password field shows current password
- [ ] Can change password and save
- [ ] Can add bank details if not set
- [ ] Can update existing bank details
- [ ] Leaving password unchanged keeps current password

### Bank Details:
- [ ] Bank details appear on salary slip
- [ ] Optional fields can be left empty
- [ ] Can update bank details anytime

---

## 📝 Notes

1. **Password Field Type**: Changed from `type="password"` to `type="text"` so admin can see password
2. **Optional Fields**: All bank fields are optional - can be added later
3. **Password Hint**: Edit mode shows "Current password shown. Change to update, or leave as-is to keep current."
4. **Local State**: `adminPassword` stored in frontend state for immediate display after save

---

## 🚀 Future Enhancements

1. Password strength indicator
2. Generate random password button
3. Force password change on first login
4. Password history (prevent reuse)
5. Encrypt `admin_password` column
6. Audit log for password changes

---

**Implementation Complete!** ✅
