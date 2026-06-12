-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE inside_jokes ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_timeline ENABLE ROW LEVEL SECURITY;

-- Superadmin bypass function
CREATE OR REPLACE FUNCTION is_superadmin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT is_superadmin FROM public.profiles WHERE id = user_id;
$$;

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id OR is_superadmin(auth.uid()));

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id OR is_superadmin(auth.uid()));

-- Profile Messages Policies
CREATE POLICY "Users can view own messages" 
ON profile_messages FOR SELECT 
TO authenticated 
USING (auth.uid() = author_id OR is_superadmin(auth.uid()));

CREATE POLICY "Users can insert own messages" 
ON profile_messages FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = author_id OR is_superadmin(auth.uid()));

-- Inside Jokes Policies
CREATE POLICY "Users can view own inside jokes" 
ON inside_jokes FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR is_superadmin(auth.uid()));

CREATE POLICY "Users can insert own inside jokes" 
ON inside_jokes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id OR is_superadmin(auth.uid()));

-- Memory Timeline Policies
CREATE POLICY "Users can view own memory timeline" 
ON memory_timeline FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR is_superadmin(auth.uid()));

CREATE POLICY "Users can insert own memory timeline" 
ON memory_timeline FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id OR is_superadmin(auth.uid()));

-- Storage bucket policies for Avatars (private, users can only access their own folder)
CREATE POLICY "Avatar insert access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Avatar select access"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  ((storage.foldername(name))[1] = auth.uid()::text OR is_superadmin(auth.uid()))
);

-- Storage bucket policies for Sounds (public)
CREATE POLICY "Sounds public select access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'sounds');
