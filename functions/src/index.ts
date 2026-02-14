import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { setGlobalOptions } from "firebase-functions/v2";
import { arrayUnion, auth, db, timestamp } from "./lib/admin";
import { requireAuth, requireOrgRole } from "./lib/authz";
import { computeIncidentDeadlines, computeReviewDate } from "./lib/deadlines";
import { buildActionTasks, computeScore } from "./lib/scoring";
import { assertArtifact, assertResponses, assertString } from "./lib/validation";
import type { AssessmentResponse, MemberRole } from "./lib/types";

setGlobalOptions({
  region: "asia-southeast1",
  maxInstances: 10,
});

const WRITE_ROLES: MemberRole[] = ["owner", "admin", "assessor"];

async function writeAuditEvent(params: {
  eventType: string;
  uid: string;
  orgId?: string;
  payload?: Record<string, unknown>;
}) {
  await db.collection("audit_events").add({
    eventType: params.eventType,
    uid: params.uid,
    orgId: params.orgId ?? null,
    payload: params.payload ?? {},
    createdAt: timestamp(),
  });
}

function buildNoticeDraft(
  noticeType: string,
  profileData: Record<string, string>
): string {
  const org = profileData.organization || "Your organization";
  const purpose = profileData.purpose || "service delivery and compliance operations";
  const disclosure = profileData.disclosure || "authorized processors and service providers";
  const contact = profileData.contact || "your DPO business contact channel";

  return [
    `Notice Type: ${noticeType}`,
    "",
    `${org} processes personal data for ${purpose}.`,
    `Personal data may be disclosed to ${disclosure}.`,
    `Data subjects can submit access/correction requests through ${contact}.`,
    "This notice is issued in accordance with Malaysia PDPA requirements.",
  ].join("\n");
}

export const assessmentStartRun = onCall(async (request) => {
  const uid = requireAuth(request.auth);
  const orgId = assertString(request.data?.orgId, "orgId");
  const templateId = assertString(request.data?.templateId, "templateId");

  await requireOrgRole(orgId, uid, WRITE_ROLES);

  const templateDoc = await db.doc(`assessment_templates/${templateId}`).get();
  const templateSnapshot = templateDoc.exists
    ? templateDoc.data()
    : { version: "MY-2026.1", questions: [] };

  const runRef = db.collection("assessment_runs").doc();
  await runRef.set({
    orgId,
    templateId,
    templateSnapshot,
    status: "in_progress",
    startedBy: uid,
    startedAt: timestamp(),
    updatedAt: timestamp(),
  });

  await writeAuditEvent({
    eventType: "assessment.start_run",
    uid,
    orgId,
    payload: { runId: runRef.id, templateId },
  });

  return {
    runId: runRef.id,
    templateSnapshot,
  };
});

export const assessmentSubmitRun = onCall(async (request) => {
  const uid = requireAuth(request.auth);
  const runId = assertString(request.data?.runId, "runId");
  const responses = assertResponses(request.data?.responses);

  const runRef = db.doc(`assessment_runs/${runId}`);
  const runDoc = await runRef.get();
  if (!runDoc.exists) {
    throw new HttpsError("not-found", "Assessment run not found.");
  }

  const runData = runDoc.data() as Record<string, unknown>;
  const orgId = assertString(runData.orgId, "assessmentRun.orgId");
  await requireOrgRole(orgId, uid, WRITE_ROLES);

  const templateSnapshot = (runData.templateSnapshot || {}) as {
    questions?: Array<unknown>;
    version?: string;
  };
  const templateQuestionCount = templateSnapshot.questions?.length || responses.length;
  const scoreBreakdown = computeScore(responses, templateQuestionCount);
  const tasks = buildActionTasks(responses);

  const assessmentRef = db.collection("assessments").doc();
  const actionPlanRef = db.collection("action_plans").doc();

  const batch = db.batch();
  batch.set(assessmentRef, {
    orgId,
    templateVersion: templateSnapshot.version || "MY-2026.1",
    responses,
    score: scoreBreakdown.percentage,
    scoreDetails: scoreBreakdown,
    riskBand: scoreBreakdown.riskBand,
    submittedBy: uid,
    submittedAt: timestamp(),
  });
  batch.set(actionPlanRef, {
    orgId,
    assessmentId: assessmentRef.id,
    tasks,
    ownerAssignments: {},
    targetDates: {},
    status: "open",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  });
  batch.update(runRef, {
    status: "submitted",
    submittedAt: timestamp(),
    updatedAt: timestamp(),
  });
  await batch.commit();

  await writeAuditEvent({
    eventType: "assessment.submit_run",
    uid,
    orgId,
    payload: {
      runId,
      assessmentId: assessmentRef.id,
      actionPlanId: actionPlanRef.id,
      riskBand: scoreBreakdown.riskBand,
    },
  });

  return {
    assessmentId: assessmentRef.id,
    score: scoreBreakdown.percentage,
    riskBand: scoreBreakdown.riskBand,
    actionPlanId: actionPlanRef.id,
  };
});

export const evidenceUpsert = onCall(async (request) => {
  const uid = requireAuth(request.auth);
  const orgId = assertString(request.data?.orgId, "orgId");
  const controlId = assertString(request.data?.controlId, "controlId");
  const artifact = assertArtifact(request.data?.artifact);
  await requireOrgRole(orgId, uid, WRITE_ROLES);

  const evidenceRef = db.collection("evidence_items").doc();
  const nextReviewAt = computeReviewDate(90);
  await evidenceRef.set({
    orgId,
    controlId,
    type: artifact.type,
    storagePath: artifact.storagePath || null,
    externalLink: artifact.externalLink || null,
    meta: artifact.meta || {},
    nextReviewAt,
    createdBy: uid,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  });

  await writeAuditEvent({
    eventType: "evidence.upsert",
    uid,
    orgId,
    payload: { evidenceId: evidenceRef.id, controlId },
  });

  return {
    evidenceId: evidenceRef.id,
    nextReviewAt,
  };
});

export const noticeGenerate = onCall(async (request) => {
  const uid = requireAuth(request.auth);
  const orgId = assertString(request.data?.orgId, "orgId");
  const noticeType = assertString(request.data?.noticeType, "noticeType");
  await requireOrgRole(orgId, uid, WRITE_ROLES);

  const rawProfile = request.data?.profileData;
  const profileData =
    rawProfile && typeof rawProfile === "object"
      ? (rawProfile as Record<string, string>)
      : {};

  const draftContent = buildNoticeDraft(noticeType, profileData);
  const noticeRef = db.collection("notices").doc();
  await noticeRef.set({
    orgId,
    noticeType,
    templateVersion: "MY-NOTICE-1",
    content: draftContent,
    status: "draft",
    version: 1,
    changeLog: [
      {
        by: uid,
        at: new Date().toISOString(),
        change: "Draft generated",
      },
    ],
    createdAt: timestamp(),
    updatedAt: timestamp(),
  });

  await writeAuditEvent({
    eventType: "notice.generate",
    uid,
    orgId,
    payload: { noticeId: noticeRef.id, noticeType },
  });

  return {
    noticeId: noticeRef.id,
    draftContent,
  };
});

export const incidentCreate = onCall(async (request) => {
  const uid = requireAuth(request.auth);
  const orgId = assertString(request.data?.orgId, "orgId");
  await requireOrgRole(orgId, uid, WRITE_ROLES);

  const payload =
    request.data?.incidentPayload && typeof request.data.incidentPayload === "object"
      ? (request.data.incidentPayload as Record<string, unknown>)
      : {};

  const detectedAt =
    typeof payload.detectedAt === "string"
      ? payload.detectedAt
      : new Date().toISOString();
  const severity =
    typeof payload.severity === "string" ? payload.severity : "medium";
  const title = typeof payload.title === "string" ? payload.title : "Incident";

  const deadlines = computeIncidentDeadlines(detectedAt);
  const incidentRef = db.collection("incidents").doc();
  const taskRefs = [db.collection("compliance_tasks").doc(), db.collection("compliance_tasks").doc(), db.collection("compliance_tasks").doc()];

  const batch = db.batch();
  batch.set(incidentRef, {
    orgId,
    title,
    severity,
    detectedAt,
    status: "open",
    notifiable: true,
    regulatorDueAt: deadlines.regulatorDueAt,
    subjectDueAt: deadlines.subjectsDueAt,
    detailsDueAt: deadlines.detailsDueAt,
    retentionUntil: deadlines.retentionUntil,
    createdBy: uid,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  });

  const taskTemplates = [
    {
      taskType: "incident.regulator_notification",
      title: "Notify regulator within 72 hours",
      dueAt: deadlines.regulatorDueAt,
    },
    {
      taskType: "incident.subject_notification",
      title: "Notify affected individuals within 7 days",
      dueAt: deadlines.subjectsDueAt,
    },
    {
      taskType: "incident.staged_details",
      title: "Submit staged details within 30 days",
      dueAt: deadlines.detailsDueAt,
    },
  ];

  taskTemplates.forEach((task, index) => {
    batch.set(taskRefs[index], {
      orgId,
      taskType: task.taskType,
      title: task.title,
      sourceRef: incidentRef.id,
      dueAt: task.dueAt,
      ownerUid: uid,
      status: "open",
      remindersSent: [],
      createdAt: timestamp(),
      updatedAt: timestamp(),
    });
  });

  await batch.commit();

  await writeAuditEvent({
    eventType: "incident.create",
    uid,
    orgId,
    payload: { incidentId: incidentRef.id },
  });

  return {
    incidentId: incidentRef.id,
    deadlineTasks: taskRefs.map((ref) => ref.id),
  };
});

export const incidentUpdateStatus = onCall(async (request) => {
  const uid = requireAuth(request.auth);
  const incidentId = assertString(request.data?.incidentId, "incidentId");
  const status = assertString(request.data?.status, "status");
  const details =
    typeof request.data?.details === "string" ? request.data.details : undefined;

  const incidentRef = db.doc(`incidents/${incidentId}`);
  const incidentDoc = await incidentRef.get();
  if (!incidentDoc.exists) {
    throw new HttpsError("not-found", "Incident not found.");
  }

  const orgId = assertString(incidentDoc.get("orgId"), "incident.orgId");
  await requireOrgRole(orgId, uid, WRITE_ROLES);

  const timelineEntry = {
    status,
    details: details || null,
    by: uid,
    at: new Date().toISOString(),
  };

  await incidentRef.update({
    status,
    timeline: arrayUnion(timelineEntry),
    updatedAt: timestamp(),
  });

  await writeAuditEvent({
    eventType: "incident.update_status",
    uid,
    orgId,
    payload: { incidentId, status },
  });

  return {
    status,
    timeline: [timelineEntry],
  };
});

export const calendarSync = onCall(async (request) => {
  const uid = requireAuth(request.auth);
  const orgId = assertString(request.data?.orgId, "orgId");
  await requireOrgRole(orgId, uid, WRITE_ROLES);

  const incidentsSnapshot = await db
    .collection("incidents")
    .where("orgId", "==", orgId)
    .limit(200)
    .get();
  const tasksSnapshot = await db
    .collection("compliance_tasks")
    .where("orgId", "==", orgId)
    .limit(1000)
    .get();

  const existing = new Set<string>();
  tasksSnapshot.forEach((doc) => {
    const sourceRef = doc.get("sourceRef");
    const taskType = doc.get("taskType");
    if (typeof sourceRef === "string" && typeof taskType === "string") {
      existing.add(`${sourceRef}:${taskType}`);
    }
  });

  const batch = db.batch();
  let createdTasks = 0;

  incidentsSnapshot.forEach((incidentDoc) => {
    const incidentId = incidentDoc.id;
    const status = incidentDoc.get("status");
    if (status === "closed") return;

    const templates = [
      {
        taskType: "incident.regulator_notification",
        dueAt: incidentDoc.get("regulatorDueAt"),
        title: "Notify regulator within 72 hours",
      },
      {
        taskType: "incident.subject_notification",
        dueAt: incidentDoc.get("subjectDueAt"),
        title: "Notify affected individuals within 7 days",
      },
      {
        taskType: "incident.staged_details",
        dueAt: incidentDoc.get("detailsDueAt"),
        title: "Submit staged details within 30 days",
      },
    ];

    for (const task of templates) {
      const key = `${incidentId}:${task.taskType}`;
      if (existing.has(key)) continue;
      const taskRef = db.collection("compliance_tasks").doc();
      batch.set(taskRef, {
        orgId,
        taskType: task.taskType,
        title: task.title,
        sourceRef: incidentId,
        dueAt: task.dueAt || null,
        ownerUid: uid,
        status: "open",
        remindersSent: [],
        createdAt: timestamp(),
        updatedAt: timestamp(),
      });
      createdTasks += 1;
      existing.add(key);
    }
  });

  if (createdTasks > 0) {
    await batch.commit();
  }

  await writeAuditEvent({
    eventType: "calendar.sync",
    uid,
    orgId,
    payload: { createdTasks },
  });

  return {
    createdTasks,
    updatedTasks: 0,
  };
});

export const adminAssignRole = onCall(async (request) => {
  const uid = requireAuth(request.auth);
  const orgId = assertString(request.data?.orgId, "orgId");
  const targetUid = assertString(request.data?.uid, "uid");
  const role = assertString(request.data?.role, "role") as MemberRole;

  if (!["owner", "admin", "assessor", "viewer"].includes(role)) {
    throw new HttpsError("invalid-argument", "Invalid role value.");
  }

  await requireOrgRole(orgId, uid, ["owner", "admin"]);

  const memberRef = db.doc(`organizations/${orgId}/members/${targetUid}`);
  await memberRef.set(
    {
      role,
      status: "active",
      invitedBy: uid,
      joinedAt: new Date().toISOString(),
      updatedAt: timestamp(),
    },
    { merge: true }
  );

  const userRecord = await auth.getUser(targetUid);
  const claims = userRecord.customClaims || {};
  await auth.setCustomUserClaims(targetUid, {
    ...claims,
    role,
    orgId,
  });

  await writeAuditEvent({
    eventType: "admin.assign_role",
    uid,
    orgId,
    payload: { targetUid, role },
  });

  return {
    membership: {
      uid: targetUid,
      role,
      status: "active",
    },
  };
});

function slugifyOrganization(orgName: string): string {
  return `org-${orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "default"}`;
}

async function migrateUsers(cursor?: string) {
  let query = db.collection("users").orderBy("__name__").limit(25);
  if (cursor) {
    query = query.startAfter(cursor);
  }

  const snapshot = await query.get();
  const batch = db.batch();
  let processed = 0;

  for (const doc of snapshot.docs) {
    const raw = doc.data() as Record<string, unknown>;
    const details = (raw.personalDetails || {}) as Record<string, unknown>;
    const orgName =
      (details.organization as string) ||
      (details.companyName as string) ||
      "Unassigned Organization";
    const orgId = slugifyOrganization(orgName);
    const name = (details.fullname as string) || (details.name as string) || "Unknown User";
    const email = (details.email as string) || "";
    const phone = (details.phoneNumber as string) || "";

    batch.set(
      db.doc(`organizations/${orgId}`),
      {
        name: orgName,
        registrationClass: "unknown",
        jurisdiction: "MY",
        dpoStatus: "required-pending",
        createdAt: timestamp(),
        updatedAt: timestamp(),
      },
      { merge: true }
    );

    batch.set(
      db.doc(`users/${doc.id}`),
      {
        name,
        email,
        phone,
        orgIds: [orgId],
        lastLoginAt: raw.lastLoginAt || null,
        migratedFromLegacy: true,
        migratedAt: timestamp(),
      },
      { merge: true }
    );

    batch.set(
      db.doc(`organizations/${orgId}/members/${doc.id}`),
      {
        role: "assessor",
        status: "active",
        joinedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    processed += 1;
  }

  if (processed > 0) {
    await batch.commit();
  }

  return {
    processed,
    nextCursor: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1].id : null,
  };
}

async function migrateQuestions(cursor?: string) {
  let query = db.collection("questions").orderBy("__name__").limit(25);
  if (cursor) {
    query = query.startAfter(cursor);
  }

  const snapshot = await query.get();
  const batch = db.batch();
  let processed = 0;

  for (const doc of snapshot.docs) {
    const raw = doc.data() as Record<string, unknown>;
    batch.set(
      db.doc(`control_library/${doc.id}`),
      {
        principle: (raw.category as string) || "General",
        controlText: (raw.question as string) || "",
        evidencePrompts: Array.isArray(raw.suggestions) ? raw.suggestions : [],
        severity: "medium",
        active: true,
        updatedAt: timestamp(),
      },
      { merge: true }
    );

    batch.set(
      db.doc("assessment_templates/my-default"),
      {
        version: "MY-2026.1",
        name: "Malaysia PDPA Baseline",
        jurisdiction: "MY",
        updatedAt: timestamp(),
      },
      { merge: true }
    );

    processed += 1;
  }

  if (processed > 0) {
    await batch.commit();
  }

  return {
    processed,
    nextCursor: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1].id : null,
  };
}

async function migrateAssessments(cursor?: string) {
  let query = db.collection("assessments").orderBy("__name__").limit(25);
  if (cursor) {
    query = query.startAfter(cursor);
  }
  const snapshot = await query.get();
  const batch = db.batch();
  let processed = 0;

  for (const doc of snapshot.docs) {
    const raw = doc.data() as Record<string, unknown>;
    const userId = typeof raw.userId === "string" ? raw.userId : "";
    const userDoc = userId ? await db.doc(`users/${userId}`).get() : null;
    const orgIds = (userDoc?.get("orgIds") || []) as string[];
    const orgId = orgIds[0] || "org-unassigned";
    const responseMap = (raw.responses || {}) as Record<string, string>;
    const responses: AssessmentResponse[] = Object.entries(responseMap).map(
      ([questionId, answer]) => ({
        questionId,
        answer: normalizeLegacyAnswer(answer),
      })
    );
    const score = computeScore(responses, responses.length);

    batch.set(
      db.doc(`assessments/${doc.id}`),
      {
        orgId,
        templateVersion: "legacy-import",
        responses,
        score: score.percentage,
        riskBand: score.riskBand,
        submittedBy: userId || null,
        submittedAt: raw.timestamp || timestamp(),
        migratedFromLegacy: true,
        migratedAt: timestamp(),
      },
      { merge: true }
    );

    processed += 1;
  }

  if (processed > 0) {
    await batch.commit();
  }

  return {
    processed,
    nextCursor: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1].id : null,
  };
}

function normalizeLegacyAnswer(value: string): AssessmentResponse["answer"] {
  const normalized = value.toLowerCase();
  if (normalized === "yes") return "yes";
  if (normalized === "partially") return "partially";
  if (normalized === "not applicable") return "not_applicable";
  return "no";
}

async function migrateFeedback(cursor?: string) {
  let query = db.collection("feedback").orderBy("__name__").limit(25);
  if (cursor) {
    query = query.startAfter(cursor);
  }

  const snapshot = await query.get();
  const batch = db.batch();
  let processed = 0;

  for (const doc of snapshot.docs) {
    const raw = doc.data() as Record<string, unknown>;
    const userId = typeof raw.userId === "string" ? raw.userId : "";
    const userDoc = userId ? await db.doc(`users/${userId}`).get() : null;
    const orgIds = (userDoc?.get("orgIds") || []) as string[];
    const orgId = orgIds[0] || "org-unassigned";

    batch.set(
      db.doc(`feedback_legacy/${doc.id}`),
      {
        orgId,
        ...raw,
        migratedAt: timestamp(),
      },
      { merge: true }
    );
    processed += 1;
  }

  if (processed > 0) {
    await batch.commit();
  }

  return {
    processed,
    nextCursor: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1].id : null,
  };
}

async function runMigrationBatch(batchType: string, cursor?: string) {
  switch (batchType) {
    case "users":
      return migrateUsers(cursor);
    case "questions":
      return migrateQuestions(cursor);
    case "assessments":
      return migrateAssessments(cursor);
    case "feedback":
      return migrateFeedback(cursor);
    default:
      throw new HttpsError(
        "invalid-argument",
        "batchType must be users, questions, assessments, or feedback."
      );
  }
}

export const migrationRunBatch = onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed." });
      return;
    }

    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing bearer token." });
      return;
    }
    const idToken = authHeader.replace("Bearer ", "");
    const decoded = await auth.verifyIdToken(idToken);
    const role = decoded.role;
    if (role !== "owner" && role !== "admin") {
      res.status(403).json({ error: "Admin role required." });
      return;
    }

    const batchType = assertString(req.body?.batchType, "batchType");
    const cursor = typeof req.body?.cursor === "string" ? req.body.cursor : undefined;
    const result = await runMigrationBatch(batchType, cursor);

    await writeAuditEvent({
      eventType: "migration.run_batch",
      uid: decoded.uid,
      payload: { batchType, ...result },
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error("migrationRunBatch failed", error);
    if (error instanceof HttpsError) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Internal migration error." });
  }
});

export const schedulerDeadlineSweep = onSchedule("every 60 minutes", async () => {
  const horizon = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const dueTasks = await db
    .collection("compliance_tasks")
    .where("status", "==", "open")
    .where("dueAt", "<=", horizon)
    .limit(200)
    .get();

  if (dueTasks.empty) {
    logger.info("schedulerDeadlineSweep: no due tasks within 24h window");
    return;
  }

  const batch = db.batch();
  const nowIso = new Date().toISOString();
  dueTasks.docs.forEach((doc) => {
    batch.update(doc.ref, {
      remindersSent: arrayUnion(nowIso),
      updatedAt: timestamp(),
    });
  });
  await batch.commit();
  logger.info("schedulerDeadlineSweep reminders updated", {
    count: dueTasks.docs.length,
  });
});
