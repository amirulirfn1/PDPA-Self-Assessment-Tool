import test from "node:test";
import assert from "node:assert/strict";
import { buildActionTasks, computeScore } from "./lib/scoring";
import { computeIncidentDeadlines } from "./lib/deadlines";

test("computeScore returns expected values", () => {
  const score = computeScore(
    [
      { questionId: "q1", answer: "yes" },
      { questionId: "q2", answer: "partially" },
      { questionId: "q3", answer: "no" },
    ],
    3
  );

  assert.equal(score.score, 3);
  assert.equal(score.maxScore, 6);
  assert.equal(score.percentage, 50);
  assert.equal(score.riskBand, "high");
});

test("buildActionTasks only includes partially and no responses", () => {
  const tasks = buildActionTasks([
    { questionId: "a", answer: "yes" },
    { questionId: "b", answer: "partially" },
    { questionId: "c", answer: "no" },
  ]);

  assert.equal(tasks.length, 2);
  assert.equal(tasks[0].controlId, "b");
  assert.equal(tasks[1].controlId, "c");
});

test("computeIncidentDeadlines returns statutory windows", () => {
  const dates = computeIncidentDeadlines("2026-01-01T00:00:00.000Z");
  assert.ok(dates.regulatorDueAt.startsWith("2026-01-04"));
  assert.ok(dates.subjectsDueAt.startsWith("2026-01-08"));
  assert.ok(dates.detailsDueAt.startsWith("2026-01-31"));
});
