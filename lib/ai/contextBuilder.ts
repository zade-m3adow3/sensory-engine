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
  const supabase = await createClient();

  let contextBlock = "No prior context available yet — respond naturally and warmly.";

  try {
    // 1. Embed the user's message
    const queryEmbedding = await embedText(userMessage);

    // 2. Retrieve top 5 semantically relevant chunks for THIS user only
    const { data: chunks, error } = await supabase.rpc("match_user_context", {
      query_embedding: queryEmbedding,
      match_user_id: userId,
      match_count: 5,
    });

    if (!error && chunks && chunks.length > 0) {
      contextBlock = chunks
        .map(
          (c: { context_type: string; content: string }) =>
            `[${c.context_type.toUpperCase()}]: ${c.content}`
        )
        .join("\n\n");
    }
  } catch (err) {
    // Non-fatal — fall back to empty context so AI still responds
    console.error("Context retrieval failed, using fallback:", err);
  }

  return getSystemPrompt(relationshipType, nickname, contextBlock);
}
