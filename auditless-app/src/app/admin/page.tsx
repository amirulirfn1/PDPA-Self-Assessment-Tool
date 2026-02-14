"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";

type RoleAssignment = {
  uid: string;
  role: "owner" | "admin" | "assessor" | "viewer";
  orgId: string;
};

export default function AdminPage() {
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);

  function onAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const assignment: RoleAssignment = {
      uid: String(formData.get("uid")),
      role: String(formData.get("role")) as RoleAssignment["role"],
      orgId: String(formData.get("orgId")),
    };
    setAssignments((prev) => [assignment, ...prev]);
    event.currentTarget.reset();
  }

  return (
    <AppShell
      title="Admin Controls"
      subtitle="Assign scoped organizational roles and monitor migration batches."
    >
      <div className="section-grid">
        <article className="panel">
          <h3>Assign Membership Role</h3>
          <form className="stack" onSubmit={onAssign}>
            <div className="field">
              <label htmlFor="orgId">Organization ID</label>
              <input id="orgId" name="orgId" required />
            </div>
            <div className="field">
              <label htmlFor="uid">User UID</label>
              <input id="uid" name="uid" required />
            </div>
            <div className="field">
              <label htmlFor="role">Role</label>
              <select id="role" name="role" required>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="assessor">Assessor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit">
              Assign Role
            </button>
          </form>
        </article>
        <article className="panel">
          <h3>Recent Role Assignments</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Org</th>
                <th>UID</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((item, idx) => (
                <tr key={`${item.uid}-${idx}`}>
                  <td className="mono">{item.orgId}</td>
                  <td className="mono">{item.uid}</td>
                  <td>{item.role}</td>
                </tr>
              ))}
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={3}>No assignments yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </article>
      </div>
    </AppShell>
  );
}
