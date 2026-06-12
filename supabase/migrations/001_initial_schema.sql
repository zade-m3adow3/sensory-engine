-- Enum for relationship type
CREATE TYPE relationship_type AS ENUM (
  'parent', 
  'relative', 
  'cousin', 
  'friend', 
  'romantic_partner', 
  'superadmin'
);

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  relationship_type relationship_type,
  gmail TEXT,
  avatar_url TEXT,
  birthdate DATE,
  song_url TEXT,
  priority_score INTEGER DEFAULT 0,
  is_superadmin BOOLEAN DEFAULT FALSE,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile Messages
CREATE TABLE profile_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inside Jokes
CREATE TABLE inside_jokes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory Timeline
CREATE TABLE memory_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  memory_date DATE,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supabase Storage buckets setup
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', false, 5242880, '{image/jpeg, image/png, image/webp, image/gif}'),
  ('sounds', 'sounds', true, null, null)
ON CONFLICT (id) DO NOTHING;
