-- Create a function to search for matching embeddings
CREATE OR REPLACE FUNCTION match_ai_context_embeddings (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  context_type context_type,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    ai_context_embeddings.id,
    ai_context_embeddings.content,
    ai_context_embeddings.context_type,
    1 - (ai_context_embeddings.embedding <=> query_embedding) AS similarity
  FROM ai_context_embeddings
  WHERE 1 - (ai_context_embeddings.embedding <=> query_embedding) > match_threshold
    AND ai_context_embeddings.user_id = p_user_id
  ORDER BY ai_context_embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;
