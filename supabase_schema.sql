-- ========================================================
-- SENSORY ENGINE: FULL SUPABASE SCHEMA REWRITE
-- ========================================================
-- IMPORTANT: Run these commands in the Supabase SQL Editor.
-- They will drop the existing tables to ensure a clean slate,
-- and then recreate them with strict Row Level Security (RLS).
-- ========================================================

-- 1. DROP EXISTING TABLES (Safeguard for a clean slate)
DROP TABLE IF EXISTS inside_jokes CASCADE;
DROP TABLE IF EXISTS profile_messages CASCADE;
DROP TABLE IF EXISTS memory_timeline CASCADE;
DROP TABLE IF EXISTS questionnaire_responses CASCADE;
DROP TABLE IF EXISTS user_embeddings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA public;

-- ========================================================
-- TABLE: profiles
-- ========================================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nickname TEXT NOT NULL,
    relationship_type TEXT NOT NULL,
    priority_score INTEGER DEFAULT 0,
    onboarding_complete BOOLEAN DEFAULT false,
    is_superadmin BOOLEAN DEFAULT false,
    avatar_url TEXT,
    song_url TEXT,
    birthdate DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Users can read their own profile
CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);
-- Superadmin can read all profiles
CREATE POLICY "Superadmins can view all profiles" 
    ON profiles FOR SELECT 
    USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_superadmin = true));
-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- ========================================================
-- TABLE: questionnaire_responses
-- ========================================================
CREATE TABLE questionnaire_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    answer_text TEXT,
    relationship_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own responses" 
    ON questionnaire_responses FOR ALL 
    USING (auth.uid() = user_id);

-- ========================================================
-- TABLE: memory_timeline
-- ========================================================
CREATE TABLE memory_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    memory_date DATE,
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE memory_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own memories" 
    ON memory_timeline FOR SELECT 
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" 
    ON memory_timeline FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- ========================================================
-- TABLE: profile_messages
-- ========================================================
CREATE TABLE profile_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profile_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" 
    ON profile_messages FOR SELECT 
    USING (auth.uid() = author_id);
CREATE POLICY "Users can insert own messages" 
    ON profile_messages FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

-- ========================================================
-- TABLE: inside_jokes
-- ========================================================
CREATE TABLE inside_jokes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    story TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE inside_jokes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own jokes" 
    ON inside_jokes FOR SELECT 
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jokes" 
    ON inside_jokes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- ========================================================
-- TABLE: user_embeddings (For Gemini RAG Context)
-- ========================================================
CREATE TABLE user_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    context_type TEXT NOT NULL, -- e.g., 'questionnaire', 'memory', 'joke', 'message'
    embedding vector(768),      -- Gemini text-embedding-004 produces 768-d vectors
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_embeddings ENABLE ROW LEVEL SECURITY;
-- Security: Embeddings are strictly isolated to the user
CREATE POLICY "Users can manage own embeddings" 
    ON user_embeddings FOR ALL 
    USING (auth.uid() = user_id);

-- Create HNSW index for fast vector searches
CREATE INDEX user_embeddings_idx ON user_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- ========================================================
-- FUNCTION: match_user_context (For Gemini RAG)
-- ========================================================
-- This function allows the AI backend to fetch context strictly for the matched user.
CREATE OR REPLACE FUNCTION match_user_context (
  query_embedding vector(768),
  match_user_id uuid,
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
) RETURNS TABLE (
  id uuid,
  content text,
  context_type text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ue.id,
    ue.content,
    ue.context_type,
    1 - (ue.embedding <=> query_embedding) AS similarity
  FROM user_embeddings ue
  WHERE ue.user_id = match_user_id
    AND 1 - (ue.embedding <=> query_embedding) > match_threshold
  ORDER BY ue.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
