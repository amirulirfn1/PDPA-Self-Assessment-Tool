export function calculateScore(responses, totalQuestions) {
  let score = 0;
  const improvementAreas = [];

  for (const questionId in responses) {
    const response = responses[questionId];
    if (response === 'Yes') {
      score += 2;
    } else if (response === 'Partially') {
      score += 1;
    } else if (response === 'No') {
      improvementAreas.push(questionId);
    }
  }

  const normalizedScore = (score / (totalQuestions * 2)) * 100;
  return { normalizedScore, improvementAreas };
}
