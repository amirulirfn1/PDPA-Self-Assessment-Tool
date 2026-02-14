import type {
  ActionTask,
  AssessmentResponse,
  RiskBand,
  ScoreBreakdown,
} from "@shared/contracts";

const ANSWER_SCORE: Record<string, number> = {
  yes: 2,
  partially: 1,
  no: 0,
  not_applicable: 2,
};

export function calculateScore(
  responses: AssessmentResponse[],
  totalQuestions: number
): ScoreBreakdown {
  const maxScore = totalQuestions * 2;
  const score = responses.reduce(
    (sum, item) => sum + (ANSWER_SCORE[item.answer] ?? 0),
    0
  );
  const percentage = maxScore === 0 ? 0 : (score / maxScore) * 100;
  const unanswered = Math.max(totalQuestions - responses.length, 0);

  return {
    score,
    maxScore,
    percentage,
    riskBand: resolveRiskBand(percentage),
    unanswered,
  };
}

export function resolveRiskBand(percentage: number): RiskBand {
  if (percentage >= 80) return "low";
  if (percentage >= 55) return "medium";
  return "high";
}

export function buildActionPlanTasks(
  responses: AssessmentResponse[]
): ActionTask[] {
  const now = new Date().toISOString().slice(0, 10);
  return responses
    .filter((response) => response.answer === "no" || response.answer === "partially")
    .map((response, idx) => ({
      id: `task-${idx + 1}`,
      controlId: response.questionId,
      title:
        response.answer === "no"
          ? "Implement missing control"
          : "Strengthen partially implemented control",
      description: `Remediate control for question ${response.questionId} and attach evidence.`,
      targetDate: now,
      status: "open",
    }));
}
