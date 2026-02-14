import { httpsCallable } from "firebase/functions";
import { functions } from "./client";
import type {
  AssessmentResponse,
  EvidenceArtifact,
  IncidentStatus,
} from "@shared/contracts";

function requireFunctions() {
  if (!functions) {
    throw new Error(
      "Firebase functions client is not configured. Set NEXT_PUBLIC_FIREBASE_* variables."
    );
  }
  return functions;
}

export async function callAssessmentStartRun(input: {
  orgId: string;
  templateId: string;
}) {
  const callable = httpsCallable<
    { orgId: string; templateId: string },
    { runId: string; templateSnapshot: unknown }
  >(requireFunctions(), "assessmentStartRun");
  const result = await callable(input);
  return result.data;
}

export async function callAssessmentSubmitRun(input: {
  runId: string;
  responses: AssessmentResponse[];
}) {
  const callable = httpsCallable<
    { runId: string; responses: AssessmentResponse[] },
    { assessmentId: string; score: number; riskBand: string; actionPlanId: string }
  >(requireFunctions(), "assessmentSubmitRun");
  const result = await callable(input);
  return result.data;
}

export async function callEvidenceUpsert(input: {
  orgId: string;
  controlId: string;
  artifact: EvidenceArtifact;
}) {
  const callable = httpsCallable<
    { orgId: string; controlId: string; artifact: EvidenceArtifact },
    { evidenceId: string; nextReviewAt: string }
  >(requireFunctions(), "evidenceUpsert");
  const result = await callable(input);
  return result.data;
}

export async function callNoticeGenerate(input: {
  orgId: string;
  noticeType: string;
  profileData: Record<string, string>;
}) {
  const callable = httpsCallable<
    { orgId: string; noticeType: string; profileData: Record<string, string> },
    { noticeId: string; draftContent: string }
  >(requireFunctions(), "noticeGenerate");
  const result = await callable(input);
  return result.data;
}

export async function callIncidentCreate(input: {
  orgId: string;
  incidentPayload: Record<string, unknown>;
}) {
  const callable = httpsCallable<
    { orgId: string; incidentPayload: Record<string, unknown> },
    { incidentId: string; deadlineTasks: string[] }
  >(requireFunctions(), "incidentCreate");
  const result = await callable(input);
  return result.data;
}

export async function callIncidentUpdateStatus(input: {
  incidentId: string;
  status: IncidentStatus;
  details?: string;
}) {
  const callable = httpsCallable<
    { incidentId: string; status: IncidentStatus; details?: string },
    { status: IncidentStatus; timeline: string[] }
  >(requireFunctions(), "incidentUpdateStatus");
  const result = await callable(input);
  return result.data;
}

export async function callCalendarSync(input: { orgId: string }) {
  const callable = httpsCallable<
    { orgId: string },
    { createdTasks: number; updatedTasks: number }
  >(requireFunctions(), "calendarSync");
  const result = await callable(input);
  return result.data;
}

export async function callAdminAssignRole(input: {
  orgId: string;
  uid: string;
  role: string;
}) {
  const callable = httpsCallable<
    { orgId: string; uid: string; role: string },
    { membership: Record<string, unknown> }
  >(requireFunctions(), "adminAssignRole");
  const result = await callable(input);
  return result.data;
}
