-- Enable pgcrypto for password hashing if not already available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Insert Mock Users into auth.users
-- Note: password for all accounts is 'password123'
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'superadmin@sensory.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"nickname": "Admin"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'partner@sensory.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"nickname": "Alex"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'friend@sensory.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"nickname": "Jordan"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'mom@sensory.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"nickname": "Mom"}', now(), now());

-- 2. Insert Profiles
INSERT INTO public.profiles (id, nickname, relationship_type, priority_score, is_superadmin, onboarding_complete)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Creator', 'superadmin', 0, true, true),
  ('22222222-2222-2222-2222-222222222222', 'Alex', 'romantic_partner', 180, false, true),
  ('33333333-3333-3333-3333-333333333333', 'Jordan', 'friend', 85, false, true),
  ('44444444-4444-4444-4444-444444444444', 'Mom', 'parent', 200, false, true);

-- 3. Insert Messages
INSERT INTO public.profile_messages (author_id, content, is_private)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Thinking about our trip to the mountains! Cant wait to go back.', false),
  ('33333333-3333-3333-3333-333333333333', 'We need to recreate that chaotic dinner from last year 😂', false),
  ('44444444-4444-4444-4444-444444444444', 'So proud of everything you are doing. Call me this weekend!', false);

-- 4. Insert Inside Jokes
INSERT INTO public.inside_jokes (user_id, title, story)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'The Great Spilled Coffee', 'Remember when I tried to be romantic bringing coffee in bed and tripped over the dog?'),
  ('33333333-3333-3333-3333-333333333333', 'Pineapple Pizza Incident', 'That time we accidentally ordered 4 pineapple pizzas instead of pepperoni and just accepted our fate.');

-- 5. Insert Memory Timeline Events
INSERT INTO public.memory_timeline (user_id, title, description, memory_date)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'First Date', 'Nervous coffee that turned into a 5-hour conversation.', '2023-04-15'),
  ('22222222-2222-2222-2222-222222222222', 'Moved in Together', 'Boxes everywhere but we were happy.', '2024-09-01'),
  ('44444444-4444-4444-4444-444444444444', 'College Graduation', 'Mom crying in the front row as usual.', '2022-05-20');
