-- =============================================
-- GOLF DRAW PLATFORM — FIXED SCHEMA
-- Run this entire file in Supabase SQL Editor
-- =============================================

-- CHARITIES (must be created FIRST — profiles references it)
create table public.charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  website_url text,
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- CHARITY EVENTS
create table public.charity_events (
  id uuid primary key default gen_random_uuid(),
  charity_id uuid references public.charities(id) on delete cascade,
  title text not null,
  event_date date,
  description text,
  created_at timestamptz default now()
);

-- USERS / PROFILES (after charities)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  email text not null,
  role text not null default 'subscriber' check (role in ('subscriber', 'admin')),
  selected_charity_id uuid references public.charities(id),
  charity_contribution_percent int default 10 check (charity_contribution_percent >= 10 and charity_contribution_percent <= 100),
  created_at timestamptz default now()
);

-- SUBSCRIPTIONS
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan text not null check (plan in ('monthly', 'yearly')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'lapsed')),
  stripe_subscription_id text,
  stripe_customer_id text,
  amount_paid numeric not null check (amount_paid >= 0),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- SCORES
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  score int not null check (score >= 1 and score <= 45),
  score_date date not null,
  created_at timestamptz default now(),
  unique(user_id, score_date)
);

-- DRAWS
create table public.draws (
  id uuid primary key default gen_random_uuid(),
  draw_month timestamptz not null,
  status text default 'pending' check (status in ('pending', 'simulated', 'published')),
  draw_type text default 'random' check (draw_type in ('random', 'algorithmic')),
  drawn_numbers int[],
  total_pool numeric default 0 check (total_pool >= 0),
  jackpot_pool numeric default 0 check (jackpot_pool >= 0),
  second_pool numeric default 0 check (second_pool >= 0),
  third_pool numeric default 0 check (third_pool >= 0),
  jackpot_rolled_over boolean default false,
  rolled_over_amount numeric default 0 check (rolled_over_amount >= 0),
  published_at timestamptz,
  created_at timestamptz default now()
);

-- DRAW ENTRIES
create table public.draw_entries (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid references public.draws(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  submitted_scores int[],
  match_count int default 0 check (match_count >= 0 and match_count <= 5),
  is_winner boolean default false,
  created_at timestamptz default now(),
  unique(draw_id, user_id)
);

-- WINNERS
create table public.winners (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid references public.draws(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  match_type text not null check (match_type in ('5-match', '4-match', '3-match')),
  prize_amount numeric check (prize_amount >= 0),
  verification_status text default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  proof_url text,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid')),
  created_at timestamptz default now()
);

-- CHARITY CONTRIBUTIONS
create table public.charity_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null not null,
  charity_id uuid references public.charities(id) on delete set null not null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  amount numeric not null check (amount >= 0),
  created_at timestamptz default now()
);

-- =============================================
-- TRIGGER: Auto-create profile on signup
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.email,
    'subscriber'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- RLS — Enable on all tables
-- =============================================
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.scores enable row level security;
alter table public.draws enable row level security;
alter table public.draw_entries enable row level security;
alter table public.winners enable row level security;
alter table public.charities enable row level security;
alter table public.charity_contributions enable row level security;

-- =============================================
-- HELPER: Admin check function
-- =============================================
create or replace function public.is_admin()
returns boolean as $$
begin
  SET search_path = public, pg_temp;
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles
create policy "Users manage own profile" on public.profiles
  for all using (auth.uid() = id or public.is_admin());

-- Scores
create policy "Users manage own scores" on public.scores
  for all using (auth.uid() = user_id or public.is_admin());

-- Subscriptions
create policy "Users view own subscription" on public.subscriptions
  for select using (auth.uid() = user_id or public.is_admin());
create policy "Admins manage subscriptions" on public.subscriptions
  for all using (public.is_admin());

-- Winners
create policy "Users view own winners" on public.winners
  for select using (auth.uid() = user_id or public.is_admin());
create policy "Admins manage winners" on public.winners
  for all using (public.is_admin());

-- Charities
create policy "Anyone view charities" on public.charities
  for select using (true);
create policy "Admins manage charities" on public.charities
  for all using (public.is_admin());

-- Draws
create policy "Anyone view published draws" on public.draws
  for select using (status = 'published' or public.is_admin());
create policy "Admins manage draws" on public.draws
  for all using (public.is_admin());

-- Draw Entries
create policy "draw_entries_owner_select" on public.draw_entries
  for select using (auth.uid() = user_id);
create policy "draw_entries_admin_all" on public.draw_entries
  for all using (public.is_admin());

-- Charity Contributions
create policy "charity_contributions_owner_select" on public.charity_contributions
  for select using (auth.uid() = user_id);
create policy "charity_contributions_admin_read" on public.charity_contributions
  for select using (public.is_admin());
create policy "charity_contributions_owner_insert" on public.charity_contributions
  for insert with check (auth.uid() = user_id);