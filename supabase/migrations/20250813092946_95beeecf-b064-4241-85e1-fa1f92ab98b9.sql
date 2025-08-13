-- First, drop the existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anyone can insert assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anyone can update assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anyone can delete assessments" ON public.assessments;

-- Make user_id column NOT NULL to ensure data integrity
-- Update existing rows without user_id to use a placeholder (they should be cleaned up manually)
UPDATE public.assessments SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;
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