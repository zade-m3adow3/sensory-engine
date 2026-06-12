-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Enum for context type
CREATE TYPE context_type AS ENUM (
  'questionnaire', 
  'message', 
  'joke', 
  'memory'
);

-- AI Context Embeddings Table
CREATE TABLE ai_context_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  context_type context_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX ON ai_context_embeddings USING hnsw (embedding vector_cosine_ops);

ALTER TABLE ai_context_embeddings ENABLE ROW LEVEL SECURITY;

-- Users can INSERT their own
CREATE POLICY "Users can insert own embeddings" 
ON ai_context_embeddings FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id OR is_superadmin(auth.uid()));

-- Only service role can SELECT
-- Service role bypasses RLS by default, but we can make it explicit
CREATE POLICY "Service role can view embeddings" 
ON ai_context_embeddings FOR SELECT 
TO service_role 
USING (true);

-- Superadmin can also view for debugging
CREATE POLICY "Superadmin can view embeddings" 
ON ai_context_embeddings FOR SELECT 
TO authenticated 
USING (is_superadmin(auth.uid()));
