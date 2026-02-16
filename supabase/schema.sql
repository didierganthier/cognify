-- Supabase Database Schema for Cognify
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Documents table
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  file_url text not null,
  file_size integer not null,
  page_count integer default 0,
  status text not null default 'processing' check (status in ('processing', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Summaries table
create table public.summaries (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references public.documents on delete cascade not null unique,
  tldr text not null,
  key_concepts jsonb default '[]'::jsonb,
  definitions jsonb default '[]'::jsonb,
  bullet_summary jsonb default '[]'::jsonb,
  audio_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Quizzes table
create table public.quizzes (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references public.documents on delete cascade not null unique,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Quiz Attempts table
create table public.quiz_attempts (
  id uuid default uuid_generate_v4() primary key,
  quiz_id uuid references public.quizzes on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  score integer not null,
  total_questions integer not null,
  answers jsonb not null default '[]'::jsonb,
  taken_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.summaries enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_attempts enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Documents policies
create policy "Users can view own documents" on public.documents
  for select using (auth.uid() = user_id);

create policy "Users can create own documents" on public.documents
  for insert with check (auth.uid() = user_id);

create policy "Users can update own documents" on public.documents
  for update using (auth.uid() = user_id);

create policy "Users can delete own documents" on public.documents
  for delete using (auth.uid() = user_id);

-- Summaries policies
create policy "Users can view summaries for own documents" on public.summaries
  for select using (
    exists (
      select 1 from public.documents 
      where documents.id = summaries.document_id 
      and documents.user_id = auth.uid()
    )
  );

create policy "Users can create summaries for own documents" on public.summaries
  for insert with check (
    exists (
      select 1 from public.documents 
      where documents.id = summaries.document_id 
      and documents.user_id = auth.uid()
    )
  );

-- Quizzes policies
create policy "Users can view quizzes for own documents" on public.quizzes
  for select using (
    exists (
      select 1 from public.documents 
      where documents.id = quizzes.document_id 
      and documents.user_id = auth.uid()
    )
  );

create policy "Users can create quizzes for own documents" on public.quizzes
  for insert with check (
    exists (
      select 1 from public.documents 
      where documents.id = quizzes.document_id 
      and documents.user_id = auth.uid()
    )
  );

-- Quiz Attempts policies
create policy "Users can view own quiz attempts" on public.quiz_attempts
  for select using (auth.uid() = user_id);

create policy "Users can create own quiz attempts" on public.quiz_attempts
  for insert with check (auth.uid() = user_id);

-- Functions

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes for better query performance
create index idx_documents_user_id on public.documents(user_id);
create index idx_documents_status on public.documents(status);
create index idx_summaries_document_id on public.summaries(document_id);
create index idx_quizzes_document_id on public.quizzes(document_id);
create index idx_quiz_attempts_user_id on public.quiz_attempts(user_id);
create index idx_quiz_attempts_quiz_id on public.quiz_attempts(quiz_id);

-- Storage Buckets (run in Supabase dashboard -> Storage)
-- Create buckets: 'documents' and 'audio'
-- Set both to public for simplicity (or configure signed URLs)
