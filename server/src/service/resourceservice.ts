import mongoose from "mongoose";
import { Asset, Ticket, WorkEvent, WorkEventActor, WorkKind } from "../models/resource.model";
import { User } from "../models/user.model";

// ---- ENV ----
export const ACCEPT_SLA_MIN = Number(process.env.ACCEPT_SLA_MIN ?? 1);
export const COMPLETE_SLA_MIN = Number(process.env.COMPLETE_SLA_MIN ?? 1);
export const NEAR_DUE_MIN = Number(process.env.NEAR_DUE_MIN ?? 1);

export const minutesToMs = (m: number) => m * 60 * 1000;

export const isValidObjectId = (id: any): id is string =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

export const isValidStatus = (s: any): s is "pending" | "accepted" | "completed" =>
  s === "pending" || s === "accepted" || s === "completed";

export async function getRole(userId: string) {
  const user = await User.findById(userId).select("role").lean();
  return user?.role ?? null;
}

export async function getCore(kind: WorkKind, refId: mongoose.Types.ObjectId) {
  return kind === "ticket"
    ? Ticket.findById(refId).lean()
    : Asset.findById(refId).lean();
}

/**
 * ✅ buildView returns:
 * - kind (ticket/asset)
 * - refId
 * - request_type (from core collection)
 * - full lifecycle: who/when + SLA dueAt
 */
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
    kind,                 // ✅ type = ticket/asset
    refId,
    request_type: (core as any)?.request_type ?? null, // ✅ core field

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

// -------------------- Notifications logic --------------------
export function nearRange() {
  const now = new Date();
  const end = new Date(now.getTime() + minutesToMs(NEAR_DUE_MIN));
  return { now, end };
}

export async function notificationsForAdmin(isNear: boolean) {
  const { now, end } = nearRange();
  const dueFilter = isNear ? { $gte: now, $lte: end } : { $lt: now };
  const nowMs = now.getTime();

  const items: any[] = [];

  for (const kind of ["ticket", "asset"] as const) {
    // A) pending accept (CREATED dueAt & no ACCEPTED)
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

    // B) pending complete (ACCEPTED dueAt & no COMPLETED)
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

  items.sort((a, b) => {
    const aDue =
      (a.deadlineType === "ACCEPT_DEADLINE" ? a.acceptDueAt : a.completeDueAt)?.getTime?.() ?? 0;
    const bDue =
      (b.deadlineType === "ACCEPT_DEADLINE" ? b.acceptDueAt : b.completeDueAt)?.getTime?.() ?? 0;
    return aDue - bDue;
  });

  return items;
}

export async function notificationsForResolver(userId: string, isNear: boolean) {
  const { now, end } = nearRange();
  const dueFilter = isNear ? { $gte: now, $lte: end } : { $lt: now };
  const nowMs = now.getTime();

  const items: any[] = [];

  for (const kind of ["ticket", "asset"] as const) {
    // resolver only sees ACCEPTED by them and NOT completed
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

  items.sort((a, b) => (a.completeDueAt?.getTime?.() ?? 0) - (b.completeDueAt?.getTime?.() ?? 0));
  return items;
}