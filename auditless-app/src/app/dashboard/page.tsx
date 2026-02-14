import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function DashboardPage() {
  return (
    <AppShell
      title="Compliance Dashboard"
      subtitle="Track organizational readiness, overdue obligations, and active remediation."
    >
      <div className="kpi-grid">
        <article className="kpi">
          <div className="value">68%</div>
          <div className="label">Current Compliance Score</div>
        </article>
        <article className="kpi">
          <div className="value">12</div>
          <div className="label">Open Action Tasks</div>
        </article>
        <article className="kpi">
          <div className="value">3</div>
          <div className="label">Incidents Requiring Follow-up</div>
        </article>
        <article className="kpi">
          <div className="value">21d</div>
          <div className="label">Nearest DPO Registration Window</div>
        </article>
      </div>

      <div className="section-grid">
        <article className="panel">
          <h3>Run New Assessment</h3>
          <p>
            Start a guided PDPA assessment mapped to Malaysia obligations and
            principles.
          </p>
          <div className="button-row">
            <Link className="btn btn-primary" href="/assessment">
              Start Assessment
            </Link>
          </div>
        </article>
        <article className="panel">
          <h3>Evidence Health</h3>
          <p>
            Review expiring evidence and upload updated implementation proof for
            controls.
          </p>
          <div className="button-row">
            <Link className="btn btn-muted" href="/evidence">
              Open Evidence Vault
            </Link>
          </div>
        </article>
        <article className="panel">
          <h3>Statutory Deadlines</h3>
          <p>
            Monitor 72-hour and 7-day windows for active incidents and submit
            staged details by day 30.
          </p>
          <div className="button-row">
            <Link className="btn btn-muted" href="/incidents">
              Open Incident Workspace
            </Link>
          </div>
        </article>
      </div>
    </AppShell>
  );
}
