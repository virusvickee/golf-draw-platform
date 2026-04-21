# 🏌️ Golf Draw Platform — Master Agent Prompt
> Stack: React + Vite + TypeScript + Tailwind CSS + shadcn/ui + Supabase + Stripe
> Deployment: Vercel (new account) + Supabase (new project)

---

## 🎯 PROJECT OVERVIEW

Build a **subscription-driven web application** that combines:
- Golf performance tracking (Stableford scoring)
- Monthly draw-based prize pools
- Charity fundraising integration

**Emotional Direction:** This is NOT a traditional golf website. It leads with **charitable impact and excitement**, not sport. Think: modern fintech meets lottery meets social good.

---

## 🎨 UI/UX DESIGN DIRECTION

### Aesthetic
- **Dark-first** design with rich, deep backgrounds (`#080B14` base)
- **Accent colors:** Electric green `#00FF87` + Gold `#FFD700` + White
- **Typography:** `Clash Display` or `Cabinet Grotesk` for headings, `DM Mono` for numbers/scores
- **Feel:** Premium, modern, motion-enhanced — like a high-end sports betting or fintech app
- **Motion:** Subtle entrance animations, number counters, smooth page transitions
- **No:** Fairways, plaid, club imagery as primary design language

### Key UI Rules
- Mobile-first, fully responsive
- Glassmorphism cards with subtle borders
- CTA buttons must be bold and persuasive
- Score numbers should feel tactile and satisfying
- Prize pool should feel exciting (animated counter)

---

## 🗂️ FOLDER STRUCTURE

```
golf-draw-platform/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── AdminLayout.tsx
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── CharitySpotlight.tsx
│   │   │   ├── PrizePool.tsx
│   │   │   └── SubscribeCTA.tsx
│   │   ├── scores/
│   │   │   ├── ScoreEntry.tsx
│   │   │   └── ScoreHistory.tsx
│   │   ├── draw/
│   │   │   ├── DrawEngine.tsx
│   │   │   └── DrawResults.tsx
│   │   ├── charity/
│   │   │   ├── CharityDirectory.tsx
│   │   │   └── CharityCard.tsx
│   │   └── admin/
│   │       ├── UserManagement.tsx
│   │       ├── DrawManagement.tsx
│   │       ├── CharityManagement.tsx
│   │       ├── WinnerVerification.tsx
│   │       └── Analytics.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── SubscribePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CharitiesPage.tsx
│   │   ├── DrawPage.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── AdminUsers.tsx
│   │       ├── AdminDraws.tsx
│   │       ├── AdminCharities.tsx
│   │       ├── AdminWinners.tsx
│   │       └── AdminAnalytics.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSubscription.ts
│   │   ├── useScores.ts
│   │   └── useDraw.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── stripe.ts
│   │   └── drawEngine.ts
│   ├── types/
│   │   └── index.ts
│   ├── store/
│   │   └── authStore.ts          # Zustand
│   └── App.tsx
├── supabase/
│   └── schema.sql
├── .env.example
└── README.md
```

---

## 🗄️ SUPABASE SCHEMA

Run this SQL in Supabase SQL Editor:

```sql
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
```

---

## 👤 AUTH SYSTEM

### Signup Flow
1. User fills: full_name, email, password
2. Supabase Auth creates user
3. Trigger auto-creates `profiles` row
4. Redirect to → Charity Selection page
5. Then → Subscription/Payment page
6. Then → Dashboard

### Login Flow
1. Email + password
2. Check subscription status on every login
3. If lapsed → show renewal banner, restrict features
4. Admin role → redirect to `/admin`

### Route Protection
```tsx
// Every protected route must check:
// 1. Is user logged in?
// 2. Is subscription active?
// 3. Is role = admin for admin routes?
```

---

## 🏌️ SCORE MANAGEMENT SYSTEM

### Rules (STRICT)
- User can have **max 5 scores** at any time
- Score range: **1–45** (Stableford)
- Each score needs a **date**
- **No duplicate dates** — same date = edit existing, not new entry
- New score when already at 5 → **oldest score is deleted automatically**
- Display: **newest first** (reverse chronological)

### Score Entry Component Logic
```tsx
const addScore = async (score: number, date: string) => {
  // 1. Check if date already exists for user
  const existing = scores.find(s => s.score_date === date)
  if (existing) {
    // Show error: "A score already exists for this date. Edit it instead."
    return
  }
  
  // 2. If already 5 scores, delete oldest before inserting
  if (scores.length >= 5) {
    const oldest = scores[scores.length - 1] // sorted newest first
    await supabase.from('scores').delete().eq('id', oldest.id)
  }
  
  // 3. Insert new score
  await supabase.from('scores').insert({ user_id, score, score_date: date })
}
```

---

## 🎰 DRAW ENGINE

### File: `src/lib/drawEngine.ts`

```typescript
// Random Draw
export const runRandomDraw = (): number[] => {
  const numbers: number[] = []
  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(n)) numbers.push(n)
  }
  return numbers.sort((a, b) => a - b)
}

// Algorithmic Draw (weighted by user score frequency)
export const runAlgorithmicDraw = (allScores: number[]): number[] => {
  // Build frequency map
  const freq: Record<number, number> = {}
  allScores.forEach(s => { freq[s] = (freq[s] || 0) + 1 })
  
  // Weight: least frequent scores get higher weight (more interesting draw)
  const maxFreq = Math.max(...Object.values(freq))
  const weighted: number[] = []
  for (let n = 1; n <= 45; n++) {
    const weight = maxFreq - (freq[n] || 0) + 1
    for (let i = 0; i < weight; i++) weighted.push(n)
  }
  
  // Pick 5 unique from weighted pool
  const picked: number[] = []
  while (picked.length < 5) {
    const idx = Math.floor(Math.random() * weighted.length)
    const n = weighted[idx]
    if (!picked.includes(n)) picked.push(n)
  }
  return picked.sort((a, b) => a - b)
}

// Check match count between drawn numbers and user scores
export const checkMatch = (drawnNumbers: number[], userScores: number[]): number => {
  return drawnNumbers.filter(n => userScores.includes(n)).length
}

// Calculate prize pools
export const calculatePools = (
  totalPool: number,
  rolledOverJackpot: number = 0
) => ({
  jackpot: (totalPool * 0.40) + rolledOverJackpot,
  second: totalPool * 0.35,
  third: totalPool * 0.25,
})
```

### Draw Execution Flow (Admin)
1. Admin opens Draw Management
2. Sees: current month, active subscriber count, total pool amount
3. Selects draw type: Random / Algorithmic
4. Clicks **"Run Simulation"** → draws numbers, shows preview, NO save yet
5. Admin reviews results — who wins, how much
6. Clicks **"Publish Draw"** → saves to DB, notifies winners
7. If no 5-match winner → jackpot amount rolls to next month's draw

---

## 💰 PRIZE POOL CALCULATION

```typescript
// Per subscription contribution to prize pool
// Assumption: 50% of subscription fee goes to prize pool
// (Charity gets user's selected %, rest = platform)

const MONTHLY_PRICE = 9.99  // example
const YEARLY_PRICE = 99.99

// Prize pool per subscriber per month:
const prizeContribution = monthlyPrice * 0.50

// Total pool = activeSubscribers * prizeContribution + rolledOverJackpot

// Distribution:
// 5-match: 40% of pool (+ rollover if any) — splits equally among all 5-match winners
// 4-match: 35% of pool — splits equally among all 4-match winners  
// 3-match: 25% of pool — splits equally among all 3-match winners
// If no 5-match winner → jackpot (40%) rolls to next month
```

---

## 🤝 CHARITY SYSTEM

### Charity Selection (at signup)
- Show grid of charity cards
- User selects ONE charity
- Default contribution: 10% of subscription fee
- User can increase % (slider: 10% to 50%)
- Can change charity from dashboard settings

### Charity Directory Page (public)
- Search by name
- Filter by category (optional)
- Featured charity at top (admin-marked)
- Each charity card: logo, name, description, "Golf Days" events list

### Independent Donation
- Separate "Donate" button on charity profile
- Not tied to subscription — one-time Stripe payment

---

## 🏆 WINNER VERIFICATION FLOW

```
Draw Published
    ↓
Winners notified via email
    ↓
Winner uploads proof (screenshot from golf app)
    ↓
Admin reviews proof in Winners panel
    ↓
Admin clicks Approve / Reject
    ↓
If Approved → payment_status: 'pending' → Admin marks 'paid'
```

---

## 📊 USER DASHBOARD

Must show ALL of these:

| Section | Details |
|---|---|
| Subscription Status | Active/Inactive, plan type, renewal date |
| Score Entry | Add/Edit scores, date picker, validation |
| Score History | Last 5 scores, newest first, edit/delete |
| Charity | Selected charity, contribution %, change option |
| Draw Participation | Next draw date, "You're entered" status |
| Past Draws | Draws entered, match results |
| Winnings | Total won, payment status per win |

---

## 🔧 ADMIN DASHBOARD

### Sections:

**1. User Management**
- Table: name, email, plan, status, scores count, joined date
- Click user → view/edit profile, view their scores, manage subscription

**2. Draw Management**
- Current month draw setup
- Select: Random / Algorithmic
- Run Simulation button (preview only)
- Publish button (finalizes draw)
- Past draws history with results
- Jackpot rollover indicator

**3. Charity Management**
- Add / Edit / Delete charities
- Upload charity image
- Mark as Featured
- Add Golf Day events

**4. Winner Verification**
- List of all winners with match type and prize
- View uploaded proof
- Approve / Reject buttons
- Mark as Paid button

**5. Analytics**
- Total active subscribers
- Monthly revenue
- Total prize pool (current month)
- Total charity contributions (all time + per charity)
- Draw statistics (match distribution)

---

## 🔐 ENVIRONMENT VARIABLES

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key (server-side only)
```

---

## 📧 EMAIL NOTIFICATIONS

Use Supabase Edge Functions + Resend (free tier):

| Trigger | Email Sent |
|---|---|
| Signup | Welcome + subscription confirmation |
| Draw Published | "Draw results are in!" |
| Winner | "Congratulations! You won £XX" |
| Winner Approved | "Your prize is being processed" |
| Subscription Renewal | Upcoming renewal reminder |
| Subscription Lapsed | Reactivation prompt |

---

## 🚀 STRIPE INTEGRATION

```typescript
// Subscription Plans (use Stripe test mode)
// Monthly: price_xxx (£9.99/month)
// Yearly: price_yyy (£99.99/year — ~17% discount)

// Flow:
// 1. User clicks Subscribe
// 2. Select plan
// 3. Stripe Checkout Session created
// 4. User completes payment
// 5. Webhook → update subscriptions table
// 6. User redirected to dashboard
```

**Stripe Webhook Events to Handle:**
- `checkout.session.completed` → activate subscription
- `invoice.payment_succeeded` → renew subscription
- `customer.subscription.deleted` → mark as cancelled
- `invoice.payment_failed` → mark as lapsed

---

## ✅ TESTING CHECKLIST

Before submission, verify ALL of these:

- [ ] Signup → charity selection → subscription flow works end-to-end
- [ ] Login redirects correctly (user → dashboard, admin → admin panel)
- [ ] Lapsed subscription → features restricted + renewal prompt shown
- [ ] Score entry: adds correctly, rejects duplicate dates, rolls oldest on 6th entry
- [ ] Score range validation: rejects < 1 and > 45
- [ ] Admin: draw simulation runs without saving
- [ ] Admin: publish draw saves results and calculates prize pools correctly
- [ ] Jackpot rollover: if no 5-match, amount carries to next draw
- [ ] Winner: can upload proof, admin can approve/reject
- [ ] Charity contribution % calculated correctly on subscription
- [ ] All dashboard sections show correct data
- [ ] Admin analytics show correct totals
- [ ] Mobile responsive on 375px, 768px, 1280px
- [ ] No console errors in production build

---

## 🧪 TEST CREDENTIALS (add to README)

```
Admin:
  Email: admin@golfdraws.com
  Password: Admin@123

Test User:
  Email: testuser@golfdraws.com
  Password: Test@123

Stripe Test Card:
  Number: 4242 4242 4242 4242
  Expiry: 12/29  CVC: 123
```

---

## 📦 NPM PACKAGES TO INSTALL

```bash
# Core
npm install @supabase/supabase-js
npm install @stripe/stripe-js @stripe/react-stripe-js

# State
npm install zustand

# UI
npm install tailwindcss @tailwindcss/vite
npx shadcn@latest init

# Forms
npm install react-hook-form zod @hookform/resolvers

# Routing
npm install react-router-dom

# Utilities
npm install date-fns
npm install lucide-react

# Charts (admin analytics)
npm install recharts

# Animations
npm install framer-motion
```

---

## ⚠️ IMPORTANT NOTES FOR AGENT

1. **Score duplicate date check** must happen BEFORE insert — use unique constraint in DB + frontend validation
2. **Admin draw simulation** must NOT save to database — only show preview in UI state
3. **Prize pool split** must handle edge case: if NO winners in a tier, that tier's amount stays in platform (does NOT roll over — only jackpot rolls)
4. **Subscription check middleware** — create a `useSubscriptionGuard` hook that checks on every protected page mount
5. **Charity contribution** is calculated at subscription creation time and logged in `charity_contributions` table
6. **Winner proof upload** goes to Supabase Storage bucket named `winner-proofs`
7. Use `date-fns` for all date operations — never raw JS Date manipulation
8. All money values stored as `numeric` in DB, displayed with 2 decimal places
9. Admin role check: `profile.role === 'admin'` — seed one admin user manually in Supabase
