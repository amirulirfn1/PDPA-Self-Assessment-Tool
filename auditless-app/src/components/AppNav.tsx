"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/dashboard", "Dashboard"],
  ["/assessment", "Assessment"],
  ["/action-plan", "Action Plan"],
  ["/evidence", "Evidence"],
  ["/inventory", "Inventory"],
  ["/notices", "Notices"],
  ["/incidents", "Incidents"],
  ["/admin", "Admin"],
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="app-nav" aria-label="Primary">
      {links.map(([href, label]) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            className={`app-nav-link ${active ? "is-active" : ""}`}
            key={href}
            href={href}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
