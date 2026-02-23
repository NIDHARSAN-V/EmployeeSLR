import mongoose from "mongoose";
import { User } from "../models/user.model";
import {
  WorkKind,
  Ticket,
  Asset,
  WorkEvent,
  WorkEventActor,
  Discussion,
  SlaAcceptBreach,
  SlaCompleteBreach,
} from "../models/resource.model";

// ---------------- ENV ----------------
export const ACCEPT_SLA_MIN = Number(process.env.ACCEPT_SLA_MIN ?? 2);
export const COMPLETE_SLA_MIN = Number(process.env.COMPLETE_SLA_MIN ?? 2);
export const NEAR_DUE_MIN = Number(process.env.NEAR_DUE_MIN ?? 1);

export const minutesToMs = (m: number) => m * 60 * 1000;

export function isValidObjectId(id: any): id is string {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
}

export function isValidStatus(s: any): s is "pending" | "accepted" | "completed" {
  return s === "pending" || s === "accepted" || s === "completed";
}

export async function getRole(userId: string) {
  const u = await User.findById(userId).select("role").lean();
  return u?.role ?? null;
}

export async function ensureDiscussion(kind: WorkKind, refId: mongoose.Types.ObjectId) {
  const exists = await Discussion.findOne({ kind, refId }).select("_id").lean();
  if (!exists) await Discussion.create({ kind, refId, messages: [] });
}

export async function getCore(kind: WorkKind, refId: mongoose.Types.ObjectId) {
  return kind === "ticket" ? Ticket.findById(refId).lean() : Asset.findById(refId).lean();
}

// ---------------- buildView (NO discussion included) ----------------
export async function buildView(kind: WorkKind, refId: mongoose.Types.ObjectId) {
  const [core, created, accepted, completed] = await Promise.all([
    getCore(kind, refId),
    WorkEvent.findOne({ kind, refId, eventType: "CREATED" }).lean(),
    WorkEvent.findOne({ kind, refId, eventType: "ACCEPTED" }).lean(),
    WorkEvent.findOne({ kind, refId, eventType: "COMPLETED" }).lean(),
  ]);

  const status = completed ? "completed" : accepted ? "accepted" : "pending";

  const createdActor = created
    ? await WorkEventActor.findOne({ eventId: created._id, role: "raised_by" }).lean()
    : null;

  const acceptedActor = accepted
    ? await WorkEventActor.findOne({ eventId: accepted._id, role: "accepted_by" }).lean()
    : null;

  const completedActor = completed
    ? await WorkEventActor.findOne({ eventId: completed._id, role: "completed_by" }).lean()
    : null;

  return {
    kind,
    refId,
    request_type: (core as any)?.request_type ?? null,
    status,

    raised_by: createdActor?.userId ?? null,
    accepted_by: acceptedActor?.userId ?? null,
    completed_by: completedActor?.userId ?? null,

    createdAt: created?.occurredAt ?? null,
    acceptedAt: accepted?.occurredAt ?? null,
    completedAt: completed?.occurredAt ?? null,

    acceptDueAt: created?.dueAt ?? null,
    completeDueAt: accepted?.dueAt ?? null,
  };
}

// ---------------- SLA breach upserts (NO duplicates) ----------------
export async function upsertAcceptBreach(kind: WorkKind, refId: mongoose.Types.ObjectId, dueAt: Date) {
  await SlaAcceptBreach.updateOne(
    { kind, refId },
    { $setOnInsert: { kind, refId, dueAt, breachedAt: new Date() } },
    { upsert: true }
  );
}

export async function upsertCompleteBreach(kind: WorkKind, refId: mongoose.Types.ObjectId, dueAt: Date) {
  await SlaCompleteBreach.updateOne(
    { kind, refId },
    { $setOnInsert: { kind, refId, dueAt, breachedAt: new Date() } },
    { upsert: true }
  );
}

// ---------------- notifications helpers ----------------
function nearRange() {
  const now = new Date();
  const end = new Date(now.getTime() + minutesToMs(NEAR_DUE_MIN));
  return { now, end };
}

/**
 * Returns overdue or near-deadline notifications for ADMIN:
 * - ACCEPT_DEADLINE : CREATED dueAt crossed/near and not accepted
 * - COMPLETE_DEADLINE: ACCEPTED dueAt crossed/near and not completed
 */
export async function notificationsForAdmin(isNear: boolean) {
  const { now, end } = nearRange();
  const dueFilter = isNear ? { $gte: now, $lte: end } : { $lt: now };
  const nowMs = now.getTime();

  const items: any[] = [];

  for (const kind of ["ticket", "asset"] as const) {
    // A) pending accept: CREATED dueAt and no ACCEPTED
    const createdDue = await WorkEvent.find({ kind, eventType: "CREATED", dueAt: dueFilter }).lean();
    for (const ce of createdDue) {
      const accepted = await WorkEvent.findOne({ kind, refId: ce.refId, eventType: "ACCEPTED" }).lean();
      if (accepted) continue;

      const view = await buildView(kind, ce.refId);
      items.push({
        ...view,
        deadlineType: "ACCEPT_DEADLINE",
        minutesLeft: ce.dueAt ? Math.ceil((ce.dueAt.getTime() - nowMs) / 60000) : null,
        isOverdue: ce.dueAt ? ce.dueAt.getTime() < nowMs : null,
      });
    }

    // B) pending complete: ACCEPTED dueAt and no COMPLETED
    const acceptedDue = await WorkEvent.find({ kind, eventType: "ACCEPTED", dueAt: dueFilter }).lean();
    for (const ae of acceptedDue) {
      const completed = await WorkEvent.findOne({ kind, refId: ae.refId, eventType: "COMPLETED" }).lean();
      if (completed) continue;

      const view = await buildView(kind, ae.refId);
      items.push({
        ...view,
        deadlineType: "COMPLETE_DEADLINE",
        minutesLeft: ae.dueAt ? Math.ceil((ae.dueAt.getTime() - nowMs) / 60000) : null,
        isOverdue: ae.dueAt ? ae.dueAt.getTime() < nowMs : null,
      });
    }
  }

  return items;
}

/**
 * Resolver sees ONLY:
 * - COMPLETE_DEADLINE for items accepted_by them and not completed
 */
export async function notificationsForResolver(userId: string, isNear: boolean) {
  const { now, end } = nearRange();
  const dueFilter = isNear ? { $gte: now, $lte: end } : { $lt: now };
  const nowMs = now.getTime();

  const items: any[] = [];

  for (const kind of ["ticket", "asset"] as const) {
    const acceptedDue = await WorkEvent.find({ kind, eventType: "ACCEPTED", dueAt: dueFilter }).lean();

    for (const ae of acceptedDue) {
      const actor = await WorkEventActor.findOne({
        eventId: ae._id,
        role: "accepted_by",
        userId,
      }).lean();

      if (!actor) continue;

      const completed = await WorkEvent.findOne({ kind, refId: ae.refId, eventType: "COMPLETED" }).lean();
      if (completed) continue;

      const view = await buildView(kind, ae.refId);
      items.push({
        ...view,
        deadlineType: "COMPLETE_DEADLINE",
        minutesLeft: ae.dueAt ? Math.ceil((ae.dueAt.getTime() - nowMs) / 60000) : null,
        isOverdue: ae.dueAt ? ae.dueAt.getTime() < nowMs : null,
      });
    }
  }

  return items;
}