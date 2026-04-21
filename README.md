# Golf Draw Platform

Golf Draw is a subscription-driven golf performance and lottery platform that empowers players to turn their Stableford scores into a chance to win monthly jackpots while passively contributing to their favorite charities.

## Features Built

- **Frontend Platform**: React, TypeScript, Vite, Tailwind CSS v4.
- **Dynamic Theming**: Premium Dark-Fintech design system (`#080B14`, `#00FF87`, `#FFD700`).
- **Supabase Backend Integration**:
  - Full Authentication & Session Management.
  - Granular Role-Based Access Guards (`subscriber` vs `admin`).
  - Native Postgres SQL triggers for profiles generation.
- **Draw Algorithm Engine**:
  - `Random` Standard generation logic.
  - `Algorithmic` Weighted Logic (prioritizes least frequent scores ensuring diverse results).
  - Accurate Match Checking & 40/35/25 auto pool distributions.
- **Admin Management Portal**:
  - User and winnings verification management.
  - `recharts` backed visual analytics.
  - Live simulation testing for pre-draw analytics.
  - Direct Charity image UI uploads to Supabase buckets.
- **Stripe Payments**:
  - Client-simulated flow constructed directly onto dashboard mapping.
  - Native fallback logic routing for lapses.

## Test Credentials

### User Testing
To perform standard actions (Scores, Choosing Charities, Upgrading Plans):
You can register an account directly on `/auth`. 

### Stripe Dummy Demo
If a Stripe UI is ever triggered in testing:
**Card**: `4242 4242 4242 4242`
**Date**: `12/30`
**CVC**: `123`

### Admin Portal
To test administrative functions, you will need to map a generated user ID from your Supabase auth table to be an `'admin'` inside the `profiles` table:
**Role Toggle**: Inside Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@test.com';
```
Then log in and navigate to your upper right profile to see the **Admin** button appear!

## Setup Instructions

1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Supabase Environment**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Deploy Database Schema**:
   Paste the contents of `supabase/schema.sql` directly into your Supabase project's SQL runner.

4. **Storage Buckets**:
   Create two publicly accessible storage buckets in Supabase:
   - `charity-images`
   - `winner-proofs`

5. **Start Dev Server**:
   ```bash
   npm run dev
   ```

## Production Deployment (Vercel)

1. Connect your GitHub repository to a new Vercel project.
2. Insert your `.env` variables under Project Settings -> Environment Variables.
3. Deploy!