// app/api/ai/chat/route.ts
import { NextRequest } from "next/server";
import { buildContext } from "@/lib/ai/contextBuilder";
import { chatWithGemini } from "@/lib/ai/gemini";
import { ratelimit } from "@/lib/upstash/ratelimit";
import { createClient } from "@/lib/supabase/server";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  "Connection": "keep-alive",
  "X-Accel-Buffering": "no",
  "X-Content-Type-Options": "nosniff",
};

function sseError(message: string) {
  return new Response(
    `data: ${JSON.stringify({ text: message })}\n\ndata: [DONE]\n\n`,
    { status: 200, headers: SSE_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return new Response("Bad Request", { status: 400 });
    }

    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorised", { status: 401 });

    // Rate limit: 20 requests per user per hour
    const { success } = await ratelimit.limit(user.id);
    if (!success) {
      return sseError("I need a little break — come back in a bit! 😊");
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname, relationship_type")
      .eq("id", user.id)
      .single();

    if (!profile) return new Response("Profile not found", { status: 404 });

    // Build RAG context + system prompt
    const systemPrompt = await buildContext(
      user.id,
      profile.relationship_type,
      profile.nickname,
      message
    );

    // Stream Gemini response
    const stream = await chatWithGemini(systemPrompt, history ?? [], message);

    return new Response(stream, { headers: SSE_HEADERS });
  } catch (err) {
    Sentry.captureException(err);
    console.error("AI chat error:", err);
    return sseError("Something went wrong — try again in a moment.");
  }
}
