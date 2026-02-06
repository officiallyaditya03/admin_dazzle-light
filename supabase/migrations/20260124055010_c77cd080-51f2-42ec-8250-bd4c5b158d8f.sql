-- Create admin_requests table for pending admin approvals
CREATE TABLE public.admin_requests (
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

-- Enable RLS
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage all requests
CREATE POLICY "Admins can manage admin requests"
ON public.admin_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own request status
CREATE POLICY "Users can view own request"
ON public.admin_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Anyone authenticated can create a request
CREATE POLICY "Authenticated users can create requests"
ON public.admin_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_admin_requests_updated_at
BEFORE UPDATE ON public.admin_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();