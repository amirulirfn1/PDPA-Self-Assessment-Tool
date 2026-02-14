"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { computeMalaysiaIncidentDeadlines } from "@/lib/deadlines";
import type { IncidentDeadlineSet } from "@shared/contracts";

type IncidentView = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high";
  deadlines: IncidentDeadlineSet;
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentView[]>([]);

  function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const detectedAt = String(formData.get("detectedAt"));
    const title = String(formData.get("title"));
    const severity = String(formData.get("severity")) as "low" | "medium" | "high";
    const deadlines = computeMalaysiaIncidentDeadlines(
      new Date(detectedAt).toISOString()
    );

    setIncidents((prev) => [
      {
        id: `INC-${prev.length + 1}`,
        title,
        severity,
        deadlines,
      },
      ...prev,
    ]);
    event.currentTarget.reset();
  }

  return (
    <AppShell
      title="Incident Workspace"
      subtitle="Automate Malaysia statutory deadline tracking for breach operations."
    >
      <div className="section-grid">
        <article className="panel">
          <h3>Create Incident</h3>
          <form className="stack" onSubmit={onCreate}>
            <div className="field">
              <label htmlFor="title">Incident Title</label>
              <input id="title" name="title" required />
            </div>
            <div className="field">
              <label htmlFor="severity">Severity</label>
              <select id="severity" name="severity" required>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="detectedAt">Detected At</label>
              <input id="detectedAt" name="detectedAt" type="datetime-local" required />
            </div>
            <button className="btn btn-primary" type="submit">
              Save Incident
            </button>
          </form>
        </article>
        <article className="panel">
          <h3>Deadline Register</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Incident</th>
                <th>Severity</th>
                <th>Regulator (72h)</th>
                <th>Subjects (7d)</th>
                <th>Details (30d)</th>
                <th>Retention (2y)</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td>
                    <div className="mono">{incident.id}</div>
                    <div>{incident.title}</div>
                  </td>
                  <td>
                    <span className={`badge ${incident.severity}`}>{incident.severity}</span>
                  </td>
                  <td>{incident.deadlines.regulatorDueAt.slice(0, 16)}</td>
                  <td>{incident.deadlines.subjectsDueAt.slice(0, 10)}</td>
                  <td>{incident.deadlines.detailsDueAt.slice(0, 10)}</td>
                  <td>{incident.deadlines.retentionUntil.slice(0, 10)}</td>
                </tr>
              ))}
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={6}>No incidents registered.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </article>
      </div>
    </AppShell>
  );
}
