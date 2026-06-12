interface Responses {
  frequency?: string;
  duration?: string;
  meanSliderScore?: number;
  longTextAnswers?: number; // count of answered long-text questions
}

export function calculatePriorityScore(relationshipType: string, responses: Responses): number {
  let score = 0;

  // Base score based on relationship
  switch (relationshipType) {
    case 'romantic_partner': 
      score += 100; 
      break;
    case 'friend': 
      // Approximating base for friend, the prompt said friend (+20 if chaos duo etc.)
      // We'll give a standard base and let modifiers handle the rest
      score += 20; 
      break;
    case 'relative': 
    case 'cousin':
      score += 15; 
      break;
    case 'parent': 
      return 200; // Parents always max visibility, not strictly scored
  }

  // Modifiers from questionnaire responses
  if (responses.frequency && responses.frequency.toLowerCase() === 'every day') {
    score += 15;
  }
  
  if (responses.duration && responses.duration.toLowerCase() === '5+ years') {
    score += 10;
  }
  
  if (responses.meanSliderScore !== undefined) {
    score += Math.min(20, responses.meanSliderScore); // proportional add up to +20
  }
  
  if (responses.longTextAnswers) {
    score += (responses.longTextAnswers * 5);
  }

  // Final constraints
  return Math.max(0, Math.min(200, score));
}

// Score mapping reference:
// 150–200 → fruit at crown of tree
// 100–149 → flower near top branches
// 60–99 → mid-branch flowers
// < 60 → lower flowers / buds
