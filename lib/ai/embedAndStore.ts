// lib/ai/embedAndStore.ts
import { embedText } from "./gemini";
import { createClient } from "@/lib/supabase/server";

export async function embedAndStore(
  userId: string,
  content: string,
  contextType: "questionnaire" | "message" | "joke" | "memory"
) {
  const supabase = await createClient();
  const embedding = await embedText(content);

  await supabase.from("ai_context_embeddings").insert({
    user_id: userId,
    content,
    embedding,
    context_type: contextType
  });
}
