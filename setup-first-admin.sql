-- Setup First Admin User
-- Run this in Supabase SQL Editor after the user has registered

-- Step 1: Check if user exists
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'webtoppertips@gmail.com';

-- Step 2: Add admin role (replace USER_ID with the ID from Step 1)
-- If you got the user ID from Step 1, use this:
INSERT INTO user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'webtoppertips@gmail.com'),
  'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: (Optional) If there's a pending admin request, approve it
UPDATE admin_requests 
SET status = 'approved',
    reviewed_by = (SELECT id FROM auth.users WHERE email = 'webtoppertips@gmail.com'),
    reviewed_at = NOW()
WHERE email = 'webtoppertips@gmail.com' AND status = 'pending';

-- Step 4: Verify admin role was added
SELECT ur.user_id, ur.role, u.email
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'webtoppertips@gmail.com';

