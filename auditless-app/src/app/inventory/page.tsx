"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";

type InventoryRecord = {
  dataCategory: string;
  purpose: string;
  system: string;
  retentionRule: string;
  crossBorder: boolean;
  owner: string;
};

export default function InventoryPage() {
  const [records, setRecords] = useState<InventoryRecord[]>([]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextRecord: InventoryRecord = {
      dataCategory: String(formData.get("dataCategory")),
      purpose: String(formData.get("purpose")),
      system: String(formData.get("system")),
      retentionRule: String(formData.get("retentionRule")),
      crossBorder: String(formData.get("crossBorder")) === "yes",
      owner: String(formData.get("owner")),
    };

    setRecords((prev) => [nextRecord, ...prev]);
    event.currentTarget.reset();
  }

  return (
    <AppShell
      title="Data Inventory + Flow Inputs"
      subtitle="Capture system-level processing records used by notices, assessments, and incidents."
    >
      <div className="section-grid">
        <article className="panel">
          <h3>Add Inventory Record</h3>
          <form className="stack" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="dataCategory">Data Category</label>
              <input id="dataCategory" name="dataCategory" required />
            </div>
            <div className="field">
              <label htmlFor="purpose">Purpose</label>
              <input id="purpose" name="purpose" required />
            </div>
            <div className="field">
              <label htmlFor="system">System</label>
              <input id="system" name="system" required />
            </div>
            <div className="field">
              <label htmlFor="retentionRule">Retention Rule</label>
              <input id="retentionRule" name="retentionRule" required />
            </div>
            <div className="field">
              <label htmlFor="crossBorder">Cross-border Transfer</label>
              <select id="crossBorder" name="crossBorder" required>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="owner">Owner</label>
              <input id="owner" name="owner" required />
            </div>
            <button className="btn btn-primary" type="submit">
              Save Record
            </button>
          </form>
        </article>
        <article className="panel">
          <h3>Inventory Snapshot</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Purpose</th>
                <th>System</th>
                <th>Retention</th>
                <th>Cross-border</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, idx) => (
                <tr key={`${record.system}-${idx}`}>
                  <td>{record.dataCategory}</td>
                  <td>{record.purpose}</td>
                  <td>{record.system}</td>
                  <td>{record.retentionRule}</td>
                  <td>{record.crossBorder ? "Yes" : "No"}</td>
                  <td>{record.owner}</td>
                </tr>
              ))}
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6}>No data inventory records captured yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </article>
      </div>
    </AppShell>
  );
}
