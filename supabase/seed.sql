-- 1. SEED CHARITIES
INSERT INTO public.charities (name, description, is_active, is_featured, image_url, website_url)
VALUES 
  ('Golf Fore Good', 'Empowering youth through the discipline and values taught by golf.', true, true, null, 'https://example.com/golfforegood'),
  ('Watering the Greens', 'Providing clean drinking water solutions to remote communities globally.', true, false, null, 'https://example.com/watering greens'),
  ('Fairway Helpers', 'Assisting disabled veterans with sports rehabilitation and accessibility.', true, false, null, 'https://example.com/fairwayhelpers'),
  ('Green Earth Initiative', 'Restoring natural habitats and planting trees around public courses.', true, false, null, 'https://example.com/greenearth');

-- 2. SEED USERS (Requires pgcrypto for password hashing)
-- Note: Make sure the pgcrypto extension is active, it is by default in Supabase.

-- Seed Admin
INSERT INTO auth.users (
  id, 
  instance_id, 
  aud, 
  role, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  raw_user_meta_data, 
  created_at, 
  updated_at
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@golfdraws.com',
  crypt('Admin@123', gen_salt('bf')),
  now(),
  '{"full_name":"Platform Admin"}',
  now(),
  now()
);

-- Note: The auth.users trigger 'on_auth_user_created' will have auto-created a 'subscriber' profile.
-- We now update that specific profile to be an 'admin'.
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Seed Test Subscriber
INSERT INTO auth.users (
  id, 
  instance_id, 
  aud, 
  role, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  raw_user_meta_data, 
  created_at, 
  updated_at
)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'testuser@golfdraws.com',
  crypt('Test@123', gen_salt('bf')),
  now(),
  '{"full_name":"Active Golfer"}',
  now(),
  now()
);

-- Link Test Subscriber to a Charity & set Contribution
UPDATE public.profiles 
SET 
  selected_charity_id = (SELECT id FROM public.charities LIMIT 1),
  charity_contribution_percent = 20
WHERE id = '22222222-2222-2222-2222-222222222222';
