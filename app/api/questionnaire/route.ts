import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { answers } = await req.json();

    // Calculate priority score (simple algorithm for now based on lengths and sliders)
    let score = 0;
    Object.values(answers).forEach((val) => {
      if (typeof val === "number") score += val * 2;
      else if (typeof val === "string") score += Math.min(val.length, 50); // Up to 50 points per text answer
      else if (Array.isArray(val)) score += val.length * 5;
    });
    // Cap at 200
    const finalScore = Math.min(Math.round(score), 200);

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        priority_score: finalScore,
        onboarding_complete: true,
      })
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // In a real implementation we would insert these into `questionnaire_responses`
    // and trigger the background vector embedding here.
    // For this boilerplate, we'll assume a Supabase edge function handles the embedding on table insert.
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in questionnaire submit:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
