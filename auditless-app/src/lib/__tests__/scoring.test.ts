import test from "node:test";
import assert from "node:assert/strict";
import { buildActionPlanTasks, calculateScore } from "../scoring";
import { computeMalaysiaIncidentDeadlines } from "../deadlines";

test("calculateScore computes percentage and risk band", () => {
  const result = calculateScore(
    [
      { questionId: "q1", answer: "yes" },
      { questionId: "q2", answer: "partially" },
      { questionId: "q3", answer: "no" },
    ],
    3
  );

  assert.equal(result.score, 3);
  assert.equal(result.maxScore, 6);
  assert.equal(result.percentage, 50);
  assert.equal(result.riskBand, "high");
});

test("buildActionPlanTasks emits remediation tasks for non-green answers", () => {
  const tasks = buildActionPlanTasks([
    { questionId: "q1", answer: "yes" },
    { questionId: "q2", answer: "partially" },
    { questionId: "q3", answer: "no" },
  ]);

  assert.equal(tasks.length, 2);
  assert.equal(tasks[0].controlId, "q2");
  assert.equal(tasks[1].controlId, "q3");
});

test("deadline helper returns all statutory windows", () => {
  const deadlines = computeMalaysiaIncidentDeadlines("2026-01-01T00:00:00.000Z");
  assert.ok(deadlines.regulatorDueAt.startsWith("2026-01-04"));
  assert.ok(deadlines.subjectsDueAt.startsWith("2026-01-08"));
  assert.ok(deadlines.detailsDueAt.startsWith("2026-01-31"));
});
