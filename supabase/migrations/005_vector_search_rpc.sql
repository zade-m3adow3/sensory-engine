-- supabase/migrations/005_vector_search_rpc.sql

create or replace function match_user_context(
  query_embedding vector(768),
  match_user_id uuid,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  context_type text,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    context_type,
    1 - (embedding <=> query_embedding) as similarity
  from ai_context_embeddings
  where user_id = match_user_id
  order by embedding <=> query_embedding
  limit match_count;
$$;
