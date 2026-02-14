import type { AssessmentTemplate } from "@shared/contracts";

export const malaysiaStarterTemplate: AssessmentTemplate = {
  version: "MY-2026.1",
  name: "Malaysia PDPA Baseline Assessment",
  jurisdiction: "MY",
  questions: [
    {
      id: "q-notice-1",
      controlId: "notice-choice",
      category: "Notice and Choice",
      question:
        "Do you issue a PDPA notice to data subjects before collecting personal data?",
      description:
        "Include purpose, disclosure scope, rights, and contact method for requests.",
    },
    {
      id: "q-security-1",
      controlId: "security-controls",
      category: "Security",
      question:
        "Are technical and organizational measures implemented to protect personal data?",
      description:
        "At minimum include access control, role separation, and audit trail access.",
    },
    {
      id: "q-retention-1",
      controlId: "retention-limits",
      category: "Retention",
      question:
        "Do you apply retention and disposal timelines to personal data categories?",
      description:
        "Track deletion/disposal evidence and disposal decision ownership.",
    },
    {
      id: "q-integrity-1",
      controlId: "data-integrity",
      category: "Data Integrity",
      question:
        "Do you maintain data accuracy checks and correction workflows for personal data?",
    },
    {
      id: "q-access-1",
      controlId: "access-requests",
      category: "Access",
      question:
        "Can data subjects request access/correction using a documented and monitored process?",
    },
  ],
};
