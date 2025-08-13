-- First, drop the existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anyone can insert assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anyone can update assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anyone can delete assessments" ON public.assessments;

-- Delete orphaned assessments that have no user_id (these are security risks anyway)
-- This removes the 94 assessments without proper ownership
DELETE FROM public.assessments WHERE user_id IS NULL;

-- Now make user_id NOT NULL to ensure data integrity going forward
ALTER TABLE public.assessments ALTER COLUMN user_id SET NOT NULL;

-- Create secure RLS policies that restrict access to assessment owners only
CREATE POLICY "Users can view their own assessments" 
ON public.assessments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" 
ON public.assessments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" 
ON public.assessments 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments" 
ON public.assessments 
FOR DELETE 
USING (auth.uid() = user_id);