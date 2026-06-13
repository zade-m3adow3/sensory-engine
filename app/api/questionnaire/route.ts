import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  processAndStoreAnswers,
  calculatePriorityScore,
} from "@/lib/questionnaire/submitHandler";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = await req.json();
    const { answers } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid answers payload" }, { status: 400 });
    }

    // Get relationship type from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("relationship_type")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const finalScore = calculatePriorityScore(answers);

    // Mark onboarding complete + set score
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ priority_score: finalScore, onboarding_complete: true })
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Store responses + embed — non-blocking from client perspective
    try {
      await processAndStoreAnswers({
        userId: user.id,
        relationshipType: profile.relationship_type,
        answers,
      });
    } catch (err) {
      // Priority score and onboarding_complete are already saved — log only
      console.error("Background processing error:", err);
    }

    return NextResponse.json({ success: true, priorityScore: finalScore });
  } catch (err) {
    console.error("Questionnaire submit error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
