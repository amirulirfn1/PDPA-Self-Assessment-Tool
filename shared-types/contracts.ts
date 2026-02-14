export type MemberRole = "owner" | "admin" | "assessor" | "viewer";
export type MembershipStatus = "active" | "invited" | "disabled";
export type RiskBand = "low" | "medium" | "high";
export type ArtifactType = "file" | "link";
export type NoticeStatus = "draft" | "published" | "archived";
export type IncidentStatus =
  | "open"
  | "investigating"
  | "notified-regulator"
  | "notified-subjects"
  | "closed";

export interface Organization {
  name: string;
  registrationClass: string;
  jurisdiction: "MY";
  dpoStatus: "not-required" | "required-pending" | "appointed" | "registered";
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  role: MemberRole;
  status: MembershipStatus;
  invitedBy?: string;
  joinedAt?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  orgIds: string[];
  lastLoginAt?: string;
}

export interface ControlLibraryItem {
  principle: string;
  controlText: string;
  evidencePrompts: string[];
  severity: RiskBand;
  active: boolean;
}

export interface AssessmentQuestion {
  id: string;
  controlId: string;
  question: string;
  category: string;
  description?: string;
}

export interface AssessmentTemplate {
  version: string;
  name: string;
  jurisdiction: "MY";
  questions: AssessmentQuestion[];
}

export type AssessmentAnswer = "yes" | "partially" | "no" | "not_applicable";

export interface AssessmentResponse {
  questionId: string;
  answer: AssessmentAnswer;
  note?: string;
}

export interface ScoreBreakdown {
  score: number;
  maxScore: number;
  percentage: number;
  riskBand: RiskBand;
  unanswered: number;
}

export interface ActionTask {
  id: string;
  controlId?: string;
  title: string;
  description: string;
  ownerUid?: string;
  targetDate?: string;
  status: "open" | "in_progress" | "done";
}

export interface EvidenceArtifact {
  type: ArtifactType;
  storagePath?: string;
  externalLink?: string;
  meta?: Record<string, unknown>;
}

export interface IncidentDeadlineSet {
  regulatorDueAt: string;
  subjectsDueAt: string;
  detailsDueAt: string;
  retentionUntil: string;
}

export interface NoticeDraft {
  noticeType: string;
  templateVersion: string;
  content: string;
}
