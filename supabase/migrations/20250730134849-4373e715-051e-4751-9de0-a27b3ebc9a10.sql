-- Update RLS policies for assessments to allow anonymous users

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own assessments." ON public.assessments;
DROP POLICY IF EXISTS "Users can insert their own assessments." ON public.assessments;
DROP POLICY IF EXISTS "Users can update their own assessments." ON public.assessments;
DROP POLICY IF EXISTS "Users can delete their own assessments." ON public.assessments;

-- Create new policies that allow anonymous access
CREATE POLICY "Anyone can view assessments" ON public.assessments
FOR SELECT USING (true);

CREATE POLICY "Anyone can insert assessments" ON public.assessments
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update assessments" ON public.assessments
FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete assessments" ON public.assessments
FOR DELETE USING (true);