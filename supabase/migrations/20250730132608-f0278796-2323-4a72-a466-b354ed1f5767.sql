-- Create table to store AI questions/queries
CREATE TABLE public.ai_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  question TEXT NOT NULL,
  answer TEXT,
  suggested_goal TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_questions
CREATE POLICY "Users can view their own questions" 
ON public.ai_questions 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own questions" 
ON public.ai_questions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own questions" 
ON public.ai_questions 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own questions" 
ON public.ai_questions 
FOR DELETE 
USING (auth.uid() = user_id OR user_id IS NULL);