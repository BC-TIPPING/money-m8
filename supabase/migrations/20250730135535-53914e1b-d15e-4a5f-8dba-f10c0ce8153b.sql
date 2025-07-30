-- Make user_id nullable to support anonymous assessments
ALTER TABLE public.assessments ALTER COLUMN user_id DROP NOT NULL;