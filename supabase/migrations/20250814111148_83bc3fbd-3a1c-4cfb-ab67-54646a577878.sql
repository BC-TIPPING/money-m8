-- Revert all database changes back to original state before security fixes

-- First, drop the strict RLS policies that were added
DROP POLICY IF EXISTS "Users can create their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can view their own assessments" ON public.assessments; 
DROP POLICY IF EXISTS "Users can update their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can delete their own assessments" ON public.assessments;

-- Make user_id nullable again (revert NOT NULL constraint)
ALTER TABLE public.assessments ALTER COLUMN user_id DROP NOT NULL;

-- Restore original permissive RLS policies that allow anonymous access
CREATE POLICY "Users can create their own assessments" 
ON public.assessments 
FOR INSERT 
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can view their own assessments" 
ON public.assessments 
FOR SELECT 
USING ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can update their own assessments" 
ON public.assessments 
FOR UPDATE 
USING ((auth.uid() = user_id) OR (user_id IS NULL))
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can delete their own assessments" 
ON public.assessments 
FOR DELETE 
USING ((auth.uid() = user_id) OR (user_id IS NULL));