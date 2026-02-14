"use client";

import { useMemo, useState } from "react";
import type { AssessmentAnswer, AssessmentResponse } from "@shared/contracts";
import { malaysiaStarterTemplate } from "@/lib/templates";
import { buildActionPlanTasks, calculateScore } from "@/lib/scoring";

type AnswerMap = Record<string, AssessmentAnswer>;

const answerOptions: Array<{ value: AssessmentAnswer; label: string }> = [
  { value: "yes", label: "Yes" },
  { value: "partially", label: "Partially" },
  { value: "no", label: "No" },
  { value: "not_applicable", label: "Not Applicable" },
];

export function AssessmentClient() {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(false);

  const responses = useMemo<AssessmentResponse[]>(
    () =>
      Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      })),
    [answers]
  );

  const score = useMemo(
    () => calculateScore(responses, malaysiaStarterTemplate.questions.length),
    [responses]
  );

  const actionTasks = useMemo(() => buildActionPlanTasks(responses), [responses]);

  return (
    <div className="stack">
      {malaysiaStarterTemplate.questions.map((question) => (
        <article className="panel" key={question.id}>
          <h3>{question.question}</h3>
          <p>{question.description}</p>
          <div className="button-row">
            {answerOptions.map((option) => (
              <button
                className={`btn ${
                  answers[question.id] === option.value ? "btn-primary" : "btn-muted"
                }`}
                key={option.value}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [question.id]: option.value }))
                }
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </article>
      ))}

      <article className="panel">
        <h3>Assessment Output</h3>
        <p>
          Completion:{" "}
          <strong>
            {responses.length}/{malaysiaStarterTemplate.questions.length}
          </strong>
        </p>
        <p>
          Score:{" "}
          <strong>
            {score.score}/{score.maxScore} ({score.percentage.toFixed(1)}%)
          </strong>
        </p>
        <p>
          Risk Band: <span className={`badge ${score.riskBand}`}>{score.riskBand}</span>
        </p>
        <div className="button-row">
          <button
            className="btn btn-primary"
            disabled={responses.length !== malaysiaStarterTemplate.questions.length}
            onClick={() => setSubmitted(true)}
            type="button"
          >
            Submit Run
          </button>
        </div>
      </article>

      {submitted ? (
        <article className="panel">
          <h3>Generated Remediation Tasks</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Control</th>
                <th>Task</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {actionTasks.map((task) => (
                <tr key={task.id}>
                  <td className="mono">{task.controlId}</td>
                  <td>{task.title}</td>
                  <td>{task.status}</td>
                </tr>
              ))}
              {actionTasks.length === 0 ? (
                <tr>
                  <td colSpan={3}>No remediation tasks generated for this run.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </article>
      ) : null}
    </div>
  );
}
