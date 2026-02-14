import { AppShell } from "@/components/AppShell";

const tasks = [
  {
    id: "AP-001",
    title: "Update PDPA Notice and Choice statement",
    owner: "DPO",
    targetDate: "2026-03-01",
    status: "open",
  },
  {
    id: "AP-002",
    title: "Implement quarterly retention disposal evidence review",
    owner: "IT Ops",
    targetDate: "2026-03-10",
    status: "in_progress",
  },
  {
    id: "AP-003",
    title: "Establish access/correction request SLA and audit trail",
    owner: "Compliance",
    targetDate: "2026-03-15",
    status: "open",
  },
];

export default function ActionPlanPage() {
  return (
    <AppShell
      title="Action Plan Board"
      subtitle="Track control remediation with clear ownership and target dates."
    >
      <article className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Task</th>
              <th>Owner</th>
              <th>Target Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td className="mono">{task.id}</td>
                <td>{task.title}</td>
                <td>{task.owner}</td>
                <td>{task.targetDate}</td>
                <td>{task.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </AppShell>
  );
}
