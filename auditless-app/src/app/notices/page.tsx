"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";

export default function NoticesPage() {
  const [draft, setDraft] = useState("");

  function onGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const org = String(formData.get("organization"));
    const purpose = String(formData.get("purpose"));
    const contact = String(formData.get("contact"));
    const disclosure = String(formData.get("disclosure"));

    setDraft(
      [
        `${org} collects personal data for the following purposes: ${purpose}.`,
        `We may disclose data to: ${disclosure}.`,
        `Data subjects may request access and correction through: ${contact}.`,
        "This notice is provided under the Malaysia PDPA Notice and Choice principle.",
      ].join("\n\n")
    );
  }

  return (
    <AppShell
      title="Notice Generator"
      subtitle="Create versioned PDPA notices with consistent structure and change logging."
    >
      <div className="section-grid">
        <article className="panel">
          <h3>Generate Draft Notice</h3>
          <form className="stack" onSubmit={onGenerate}>
            <div className="field">
              <label htmlFor="organization">Organization Name</label>
              <input id="organization" name="organization" required />
            </div>
            <div className="field">
              <label htmlFor="purpose">Primary Processing Purpose</label>
              <textarea id="purpose" name="purpose" rows={3} required />
            </div>
            <div className="field">
              <label htmlFor="disclosure">Disclosure Categories</label>
              <input id="disclosure" name="disclosure" required />
            </div>
            <div className="field">
              <label htmlFor="contact">Access/Correction Contact Method</label>
              <input id="contact" name="contact" required />
            </div>
            <button className="btn btn-primary" type="submit">
              Generate Draft
            </button>
          </form>
        </article>
        <article className="panel">
          <h3>Draft Output</h3>
          <pre
            className="mono"
            style={{
              whiteSpace: "pre-wrap",
              margin: 0,
              minHeight: 220,
              color: "#293628",
            }}
          >
            {draft || "No draft generated yet."}
          </pre>
        </article>
      </div>
    </AppShell>
  );
}
