import type { IncidentDeadlineSet } from "@shared/contracts";

const DAY_MS = 24 * 60 * 60 * 1000;

function plusDays(input: Date, days: number): string {
  return new Date(input.getTime() + days * DAY_MS).toISOString();
}

function plusHours(input: Date, hours: number): string {
  return new Date(input.getTime() + hours * 60 * 60 * 1000).toISOString();
}

export function computeMalaysiaIncidentDeadlines(
  detectedAtIso: string
): IncidentDeadlineSet {
  const detectedAt = new Date(detectedAtIso);
  return {
    regulatorDueAt: plusHours(detectedAt, 72),
    subjectsDueAt: plusDays(detectedAt, 7),
    detailsDueAt: plusDays(detectedAt, 30),
    retentionUntil: plusDays(detectedAt, 730),
  };
}
