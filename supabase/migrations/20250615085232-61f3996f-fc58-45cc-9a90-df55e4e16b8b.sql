
-- Drop existing auth-related objects
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.profiles;
drop table if exists public.assessments;

-- Create a new assessments table without user authentication
create table public.assessments (
  id uuid not null default gen_random_uuid() primary key,
  username text,
  created_at timestamp with time zone not null default now(),
  employment_status text,
  has_regular_income boolean,
  income_sources jsonb,
  expense_items jsonb,
  financial_knowledge_level text,
  investment_experience text[],
  goals text[],
  other_goal text,
  goal_timeframe text,
  debt_types text[],
  debt_details jsonb,
  debt_management_confidence text,
  free_text_comments text
);
