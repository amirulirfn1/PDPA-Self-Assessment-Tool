"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";

type EvidenceItem = {
  id: string;
  controlId: string;
  artifactType: "file" | "link";
  reference: string;
  nextReviewAt: string;
};

export default function EvidencePage() {
  const [items, setItems] = useState<EvidenceItem[]>([]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const item: EvidenceItem = {
      id: `EV-${items.length + 1}`,
      controlId: String(formData.get("controlId")),
      artifactType: String(formData.get("artifactType")) as "file" | "link",
      reference: String(formData.get("reference")),
      nextReviewAt: String(formData.get("nextReviewAt")),
    };
    setItems((prev) => [item, ...prev]);
    event.currentTarget.reset();
  }

  return (
    <AppShell
      title="Evidence Vault"
      subtitle="Attach implementation proof to each control and schedule review cycles."
    >
      <div className="section-grid">
        <article className="panel">
          <h3>Add Evidence</h3>
          <form className="stack" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="controlId">Control ID</label>
              <input id="controlId" name="controlId" required />
            </div>
            <div className="field">
              <label htmlFor="artifactType">Artifact Type</label>
              <select id="artifactType" name="artifactType" required>
                <option value="file">File</option>
                <option value="link">Link</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="reference">Storage Path / Link</label>
              <input id="reference" name="reference" required />
            </div>
            <div className="field">
              <label htmlFor="nextReviewAt">Next Review Date</label>
              <input id="nextReviewAt" name="nextReviewAt" type="date" required />
            </div>
            <button className="btn btn-primary" type="submit">
              Save Evidence Item
            </button>
          </form>
        </article>

        <article className="panel">
          <h3>Evidence Register</h3>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Control</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Next Review</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="mono">{item.id}</td>
                  <td>{item.controlId}</td>
                  <td>{item.artifactType}</td>
                  <td>{item.reference}</td>
                  <td>{item.nextReviewAt}</td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5}>No evidence recorded yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </article>
      </div>
    </AppShell>
  );
}
