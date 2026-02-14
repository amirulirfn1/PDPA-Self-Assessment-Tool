import Link from "next/link";

export default function HomePage() {
  return (
    <div className="app-main">
      <section className="hero-card">
        <h1>PDPA Compliance Platform</h1>
        <p>
          Next.js + Firebase refactor foundation for Malaysia-first compliance
          operations.
        </p>
        <div className="button-row">
          <Link className="btn btn-primary" href="/signin">
            Sign In
          </Link>
          <Link className="btn btn-muted" href="/dashboard">
            Open Dashboard
          </Link>
        </div>
      </section>
      <section className="section-grid">
        <article className="panel">
          <h3>Guided Assessment</h3>
          <p>Template-driven questionnaire with score and risk band.</p>
        </article>
        <article className="panel">
          <h3>Action Plans</h3>
          <p>Control-level remediation tasks with owners and target dates.</p>
        </article>
        <article className="panel">
          <h3>Incident Deadlines</h3>
          <p>
            Malaysia statutory timelines automated: 72h / 7d / 30d / 2y.
          </p>
        </article>
      </section>
    </div>
  );
}
