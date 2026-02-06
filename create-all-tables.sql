-- ============================================
-- COMPLETE DATABASE SETUP FOR ADMIN PANEL
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- Step 1: Create app_role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Step 3: Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 5: RLS policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Step 6: Create admin_requests table
CREATE TABLE IF NOT EXISTS public.admin_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 7: Enable RLS on admin_requests
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;

-- Step 8: RLS policies for admin_requests
DROP POLICY IF EXISTS "Admins can manage admin requests" ON public.admin_requests;
CREATE POLICY "Admins can manage admin requests"
ON public.admin_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view own request" ON public.admin_requests;
CREATE POLICY "Users can view own request"
ON public.admin_requests
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can create requests" ON public.admin_requests;
CREATE POLICY "Authenticated users can create requests"
ON public.admin_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Step 9: Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Step 10: Create trigger for admin_requests updated_at
DROP TRIGGER IF EXISTS update_admin_requests_updated_at ON public.admin_requests;
CREATE TRIGGER update_admin_requests_updated_at
BEFORE UPDATE ON public.admin_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Step 11: Create products table (if needed)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  mrp DECIMAL(10,2),
  wattage INTEGER,
  lumens INTEGER,
  color_temperature TEXT,
  shape TEXT,
  mounting_type TEXT,
  material TEXT,
  ip_rating TEXT,
  voltage TEXT,
  warranty TEXT,
  moq INTEGER DEFAULT 1,
  certifications TEXT[],
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 12: Create inquiry_status enum
DO $$ BEGIN
  CREATE TYPE public.inquiry_status AS ENUM ('new', 'contacted', 'negotiating', 'quoted', 'won', 'lost', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 13: Create inquiries table (if needed)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT NOT NULL,
  product_interest TEXT,
  quantity INTEGER,
  status inquiry_status NOT NULL DEFAULT 'new',
  priority TEXT DEFAULT 'normal',
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- NOW ADD ADMIN ROLE FOR webtoppertips@gmail.com
-- ============================================

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

-- Verify the admin role was added
SELECT 
  ur.user_id, 
  ur.role, 
  u.email,
  u.created_at as user_created_at
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'webtoppertips@gmail.com';

