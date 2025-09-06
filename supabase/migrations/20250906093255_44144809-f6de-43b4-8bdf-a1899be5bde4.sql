-- Fix the INSERT policy for assessments table to allow anonymous users
DROP POLICY IF EXISTS "Users can create their own assessments" ON public.assessments;

-- Create a new INSERT policy that allows both authenticated and anonymous users
CREATE POLICY "Users can create their own assessments" 
ON public.assessments 
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) OR 
  (user_id IS NULL)
);