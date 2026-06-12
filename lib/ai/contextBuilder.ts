// lib/ai/contextBuilder.ts
import { embedText } from "./gemini";
import { createClient } from "@/lib/supabase/server";
import { getSystemPrompt } from "./prompts";

export async function buildContext(
  userId: string,
  relationshipType: string,
  nickname: string,
  userMessage: string
): Promise<string> {
  const supabase = createClient();

  // 1. Embed the user's message
  const queryEmbedding = await embedText(userMessage);

  // 2. Retrieve top 5 relevant context chunks for THIS user only
  const { data: chunks } = await supabase.rpc("match_user_context", {
    query_embedding: queryEmbedding,
    match_user_id: userId,
    match_count: 5
  });

  // 3. Format chunks into readable context
  const contextBlock = chunks
    ?.map((c: any) => `[${c.context_type}]: ${c.content}`)
    .join("\n") ?? "No prior context available.";

  // 4. Build final system prompt
  return getSystemPrompt(relationshipType, nickname, contextBlock);
}
