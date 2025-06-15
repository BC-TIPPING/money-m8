
-- To avoid issues with existing data, we'll clear the assessments table.
-- This is a destructive operation required for the security refactor.
TRUNCATE public.assessments;

-- Drop the now-unused username column
ALTER TABLE public.assessments
DROP COLUMN IF EXISTS username;

-- Add a user_id column that references the authenticated user
ALTER TABLE public.assessments
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make the user_id column mandatory
UPDATE public.assessments SET user_id = auth.uid() WHERE user_id IS NULL;
ALTER TABLE public.assessments
ALTER COLUMN user_id SET NOT NULL;

-- Create a table for public profiles, which will be linked to users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  updated_at timestamp with time zone,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  website text,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS) for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create a function to automatically create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$;

-- Create a trigger that executes the function when a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable Row Level Security on the assessments table
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the assessments table
-- Allow users to view their own assessments
CREATE POLICY "Users can view their own assessments." ON public.assessments
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own assessments
CREATE POLICY "Users can insert their own assessments." ON public.assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own assessments
CREATE POLICY "Users can update their own assessments." ON public.assessments
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own assessments
CREATE POLICY "Users can delete their own assessments." ON public.assessments
  FOR DELETE USING (auth.uid() = user_id);
