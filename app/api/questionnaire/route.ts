import { NextResponse } from 'next/server';
import { createClient } from '../../lib/supabase/server';
import { calculatePriorityScore } from '../../lib/utils/priorityScore';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { responses } = await req.json();

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('relationship_type')
      .eq('id', user.id)
      .single();

    const inserts = responses.map((r: any) => ({
      user_id: user.id,
      question_id: r.questionId,
      question_text: r.questionText,
      answer: r.answer
    }));

    const { error: insertError } = await supabase
      .from('questionnaire_responses')
      .insert(inserts);

    if (insertError) {
      throw insertError;
    }

    // Update priority score passing relationship type
    const score = calculatePriorityScore(responses, profile?.relationship_type || 'friend');
    
    await supabase
      .from('profiles')
      .update({ priority_score: score, onboarding_complete: true })
      .eq('id', user.id);

    return NextResponse.json({ success: true, score });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
