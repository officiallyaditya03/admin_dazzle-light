-- Confirm email for webtoppertips@gmail.com
-- This will allow the user to login without email confirmation

UPDATE auth.users
SET 
  email_confirmed_at = NOW()
WHERE email = 'webtoppertips@gmail.com';

-- Verify the user is confirmed
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
WHERE email = 'webtoppertips@gmail.com';

