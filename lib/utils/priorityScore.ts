export function calculatePriorityScore(responses: any[], relationshipType: string): number {
  if (relationshipType === 'parent') {
    return 200; // Parents are max visibility
  }

  let base = 0;
  if (relationshipType === 'romantic_partner') base = 100;

  let modifier = 0;
  let sliderTotal = 0;
  let sliderCount = 0;

  for (const r of responses) {
    const qid = r.questionId;
    const ans = r.answer;

    // Direct string match modifiers
    if (qid === 'f9' && (ans === 'Chaos duo 🔥' || ans === 'Emotional support pillars 🫂')) modifier += 20;
    if (qid === 'r1' && ans === 'Close like siblings') modifier += 15;
    if (ans === 'Every day, no missing') modifier += 15;
    if (ans === '5+ years — OG status') modifier += 10;

    // Track sliders
    if (typeof ans === 'number') {
      sliderTotal += ans;
      sliderCount++;
    }

    // Long text responses proxy (checking length and specific question IDs)
    if (typeof ans === 'string' && ans.length > 20 && 
       (qid === 'p2' || qid === 'p5' || qid === 'r2' || qid === 'f2' || qid === 'f10' || qid === 'rp1' || qid === 'rp6' || qid === 'rp10')) {
      modifier += 5;
    }
  }

  // Mean score from sliders -> proportional add up to +20
  let sliderBonus = 0;
  if (sliderCount > 0) {
    const mean = sliderTotal / sliderCount; // Scale 1 to 10
    sliderBonus = (mean / 10) * 20;
  }

  return Math.min(200, Math.round(base + modifier + sliderBonus));
}
