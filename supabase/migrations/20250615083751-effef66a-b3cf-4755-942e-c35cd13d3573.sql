
-- Create a table for public profiles
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  primary key (id),
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile for new users.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create assessments table
create table public.assessments (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
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

-- Add RLS to assessments table
alter table public.assessments
  enable row level security;

create policy "Users can view their own assessments." on public.assessments
  for select using (auth.uid() = user_id);

create policy "Users can insert their own assessments." on public.assessments
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own assessments." on public.assessments
  for update using (auth.uid() = user_id);

create policy "Users can delete their own assessments." on public.assessments
  for delete using (auth.uid() = user_id);
