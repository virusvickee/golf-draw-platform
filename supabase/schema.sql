-- USERS (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) primary key,
  full_name text not null,
  email text not null,
  role text not null default 'subscriber', -- 'subscriber' | 'admin'
  selected_charity_id uuid,
  charity_contribution_percent int default 10, -- min 10, max 100
  created_at timestamptz default now()
);

-- SUBSCRIPTIONS
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  plan text not null, -- 'monthly' | 'yearly'
  status text not null default 'active', -- 'active' | 'cancelled' | 'lapsed'
  stripe_subscription_id text,
  stripe_customer_id text,
  amount_paid numeric not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- CHARITIES
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
  charity_id uuid references public.charities(id),
  title text not null,
  event_date date,
  description text,
  created_at timestamptz default now()
);

-- SCORES
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  score int not null check (score >= 1 and score <= 45), -- Stableford range
  score_date date not null,
  created_at timestamptz default now(),
  unique(user_id, score_date) -- no duplicate dates per user
);

-- DRAWS
create table public.draws (
  id uuid primary key default gen_random_uuid(),
  draw_month date not null, -- first day of the draw month
  status text default 'pending', -- 'pending' | 'simulated' | 'published'
  draw_type text default 'random', -- 'random' | 'algorithmic'
  drawn_numbers int[], -- array of 5 numbers
  total_pool numeric default 0,
  jackpot_pool numeric default 0, -- 40%
  second_pool numeric default 0,  -- 35%
  third_pool numeric default 0,   -- 25%
  jackpot_rolled_over boolean default false,
  rolled_over_amount numeric default 0,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- DRAW ENTRIES (user's scores at time of draw)
create table public.draw_entries (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid references public.draws(id),
  user_id uuid references public.profiles(id),
  submitted_scores int[], -- snapshot of user's 5 scores at draw time
  match_count int default 0, -- 3, 4, or 5
  is_winner boolean default false,
  created_at timestamptz default now()
);

-- WINNERS
create table public.winners (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid references public.draws(id),
  user_id uuid references public.profiles(id),
  match_type text not null, -- '5-match' | '4-match' | '3-match'
  prize_amount numeric,
  verification_status text default 'pending', -- 'pending' | 'approved' | 'rejected'
  proof_url text, -- uploaded screenshot
  payment_status text default 'pending', -- 'pending' | 'paid'
  created_at timestamptz default now()
);

-- CHARITY CONTRIBUTIONS LOG
create table public.charity_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  charity_id uuid references public.charities(id),
  subscription_id uuid references public.subscriptions(id),
  amount numeric not null,
  created_at timestamptz default now()
);

-- PROFILE AUTO-CREATION TRIGGER
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, 'subscriber');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS POLICIES
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.scores enable row level security;
alter table public.draw_entries enable row level security;
alter table public.winners enable row level security;

-- Users can only read/write their own data
create policy "Users manage own profile" on public.profiles
  for all using (auth.uid() = id);

create policy "Users manage own scores" on public.scores
  for all using (auth.uid() = user_id);

create policy "Users view own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "Users view own draw entries" on public.draw_entries
  for select using (auth.uid() = user_id);

create policy "Users view own winners" on public.winners
  for select using (auth.uid() = user_id);

-- Public read for charities and draws
create policy "Anyone can view charities" on public.charities
  for select using (true);

create policy "Anyone can view published draws" on public.draws
  for select using (status = 'published');
