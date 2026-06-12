// app/api/ai/chat/route.ts
import { NextRequest } from "next/server";
import { buildContext } from "@/lib/ai/contextBuilder";
import { chatWithGemini } from "@/lib/ai/gemini";
import { ratelimit } from "@/lib/upstash/ratelimit";
import { createClient } from "@/lib/supabase/server";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorised", { status: 401 });

    // Rate limit: 20 requests per user per hour
    const { success } = await ratelimit.limit(user.id);
    if (!success) return new Response("Too many requests", { status: 429 });

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

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (err) {
    Sentry.captureException(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
