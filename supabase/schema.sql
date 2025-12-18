-- Create users table
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  subscription_status text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create email_accounts table
create table if not exists public.email_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  email_address text not null,
  smtp_host text not null,
  smtp_port integer not null,
  imap_host text not null,
  imap_port integer not null,
  encrypted_password text not null,
  iv text not null,
  daily_limit integer default 50,
  current_warmup_score integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create email_logs table
create table if not exists public.email_logs (
  id uuid default gen_random_uuid() primary key,
  account_id uuid references public.email_accounts(id) on delete cascade not null,
  type text check (type in ('SENT', 'RECEIVED')) not null,
  status text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  details jsonb
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.email_accounts enable row level security;
alter table public.email_logs enable row level security;

-- Create policies (simplified for MVP, allowing access mainly via server-side or authenticated user)
-- Users can see their own data
create policy "Users can view own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own data" on public.users
  for update using (auth.uid() = id);

create policy "Users can view own email accounts" on public.email_accounts
  for select using (auth.uid() = user_id);

create policy "Users can insert own email accounts" on public.email_accounts
  for insert with check (auth.uid() = user_id);

create policy "Users can update own email accounts" on public.email_accounts
  for update using (auth.uid() = user_id);

create policy "Users can delete own email accounts" on public.email_accounts
  for delete using (auth.uid() = user_id);

-- Logs access
create policy "Users can view own logs" on public.email_logs
  for select using (
    exists (
      select 1 from public.email_accounts
      where email_accounts.id = email_logs.account_id
      and email_accounts.user_id = auth.uid()
    )
  );
