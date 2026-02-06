# Setup First Admin User

## Quick Setup for: webtoppertips@gmail.com

### Step 1: Create the User Account

**Option A: Register through the UI (Recommended)**
1. Go to: `http://localhost:5173/admin/register`
2. Fill in:
   - Full Name: (any name)
   - Email: `webtoppertips@gmail.com`
   - Password: `Dazzle@123!`
   - Confirm Password: `Dazzle@123!`
3. Click "Request Admin Access"
4. You'll be redirected to login page

**Option B: Create via Supabase Dashboard**
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create New User"
3. Enter:
   - Email: `webtoppertips@gmail.com`
   - Password: `Dazzle@123!`
   - Auto Confirm User: ✅ (check this)

### Step 2: Grant Admin Access

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste this SQL:

```sql
-- Add admin role for webtoppertips@gmail.com
INSERT INTO user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'webtoppertips@gmail.com'),
  'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Approve any pending admin request
UPDATE admin_requests 
SET status = 'approved',
    reviewed_by = (SELECT id FROM auth.users WHERE email = 'webtoppertips@gmail.com'),
    reviewed_at = NOW()
WHERE email = 'webtoppertips@gmail.com' AND status = 'pending';
```

3. Click "Run" to execute

### Step 3: Verify Access

1. Go to: `http://localhost:5173/admin/login`
2. Login with:
   - Email: `webtoppertips@gmail.com`
   - Password: `Dazzle@123!`
3. You should now have full admin access!

## Troubleshooting

If login fails:
- Make sure the user exists in Supabase Auth (check Authentication → Users)
- Verify the admin role was added (run the SELECT query in setup-first-admin.sql)
- Check browser console for errors

