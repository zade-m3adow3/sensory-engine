// lib/questionnaire/submitHandler.ts
import { embedAndStore } from "@/lib/ai/embedAndStore";
import { createClient } from "@/lib/supabase/server";

interface SubmitOptions {
  userId: string;
  relationshipType: string;
  answers: Record<string, string | number | string[]>;
}

/**
 * Saves questionnaire responses to questionnaire_responses table,
 * embeds text answers into the vector store, and updates profile fields.
 */
export async function processAndStoreAnswers({
  userId,
  relationshipType,
  answers,
}: SubmitOptions): Promise<void> {
  const supabase = await createClient();

  // 1. Build response rows
  const rows = Object.entries(answers).map(([questionId, answer]) => ({
    user_id: userId,
    question_id: questionId,
    answer_text: Array.isArray(answer) ? answer.join(", ") : String(answer),
    relationship_type: relationshipType,
  }));

  // 2. Upsert (idempotent — safe to call multiple times)
  const { error: insertError } = await supabase
    .from("questionnaire_responses")
    .upsert(rows, { onConflict: "user_id,question_id" });

  if (insertError) {
    console.error("Failed to insert questionnaire responses:", insertError);
    // Non-fatal — embeddings can still proceed
  }

  // 3. Extract and save profile fields
  const profileUpdates: Record<string, unknown> = {};

  // Song URL — the "what's your song" question for each relationship type
  const songQuestionIds = ["p6", "r5", "f5", "rp4"];
  for (const qId of songQuestionIds) {
    if (answers[qId]) {
      profileUpdates.song_url = String(answers[qId]);
      break;
    }
  }

  if (Object.keys(profileUpdates).length > 0) {
    await supabase.from("profiles").update(profileUpdates).eq("id", userId);
  }

  // 4. Embed text answers concurrently (failures are soft — don't block)
  const jobs: Promise<void>[] = [];

  for (const [questionId, answer] of Object.entries(answers)) {
    if (typeof answer === "number") continue; // skip slider numbers
    const text = Array.isArray(answer) ? answer.join(", ") : String(answer);
    if (text.trim().length < 4) continue; // skip trivially short

    const content = `Q${questionId}: ${text}`;
    jobs.push(
      embedAndStore(userId, content, "questionnaire").catch((err) =>
        console.warn("Embedding failed for", questionId, err)
      )
    );
  }

  await Promise.allSettled(jobs);
}

/**
 * Calculate a priority score (0–200) from the full answers map.
 */
export function calculatePriorityScore(
  answers: Record<string, string | number | string[]>
): number {
  let score = 0;
  for (const val of Object.values(answers)) {
    if (typeof val === "number")       score += val * 3;          // sliders (1–10) → up to 30 pts each
    else if (typeof val === "string")  score += Math.min(val.length / 2, 40); // text length
    else if (Array.isArray(val))       score += val.length * 8;   // multi-select choices
  }
  return Math.min(Math.round(score), 200);
}
