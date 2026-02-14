import Link from "next/link";
import { AppNav } from "./AppNav";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
};

export function AppShell({ children, title, subtitle }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link className="app-brand" href="/dashboard">
            PDPA Malaysia Compliance Ops
          </Link>
          <AppNav />
        </div>
      </header>
      <main className="app-main">
        <section className="hero-card">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </section>
        <section style={{ marginTop: 16 }}>{children}</section>
      </main>
    </div>
  );
}
