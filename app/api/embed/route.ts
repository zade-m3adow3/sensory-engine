import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embedAndStore } from "@/lib/ai/embedAndStore";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { content, contextType } = await req.json();
    if (!content || !contextType) {
      return NextResponse.json({ error: "Missing content or contextType" }, { status: 400 });
    }

    await embedAndStore(user.id, content, contextType);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Embed route error:", err);
    return NextResponse.json({ error: "Embed failed" }, { status: 500 });
  }
}
