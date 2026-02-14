import { AppShell } from "@/components/AppShell";
import { AssessmentClient } from "./AssessmentClient";

export default function AssessmentPage() {
  return (
    <AppShell
      title="Guided Assessment Run"
      subtitle="Malaysia PDPA baseline questionnaire mapped to prioritized controls."
    >
      <AssessmentClient />
    </AppShell>
  );
}
