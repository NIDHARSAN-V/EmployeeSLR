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

import mongoose from "mongoose";
import { User } from "../models/user.model";
import {
  isValidObjectId,
  getRole,
  buildView,
  nearRange,
  minutesToMs,
  NEAR_DUE_MIN
} from "./resourceservice";





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






export async function slaBreached(kind: WorkKind) {

  const now = new Date();
  const items:any[] = [];

  // ACCEPT DEADLINE BREACHED
  const created = await WorkEvent.find({
    kind,
    eventType: "CREATED",
    dueAt: { $lt: now }
  }).lean();

  for (const ce of created) {

    const accepted = await WorkEvent.findOne({
      kind,
      refId: ce.refId,
      eventType: "ACCEPTED"
    });

    if (accepted) continue;

    const view = await buildView(kind, ce.refId);

    items.push({
      ...view,
      eventId: ce._id,
      deadlineType: "ACCEPT_DEADLINE",
      isOverdue: true
    });

  }

  // COMPLETE DEADLINE BREACHED
  const accepted = await WorkEvent.find({
    kind,
    eventType: "ACCEPTED",
    dueAt: { $lt: now }
  }).lean();

  for (const ae of accepted) {

    const completed = await WorkEvent.findOne({
      kind,
      refId: ae.refId,
      eventType: "COMPLETED"
    });

    if (completed) continue;

    const view = await buildView(kind, ae.refId);

    items.push({
      ...view,
      eventId: ae._id,
      deadlineType: "COMPLETE_DEADLINE",
      isOverdue: true
    });

  }

  return items;
}







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

export async function slaNear(kind: WorkKind) {

  const now = new Date();
  const end = new Date(now.getTime() + minutesToMs(NEAR_DUE_MIN));

  const items:any[] = [];

  const created = await WorkEvent.find({
    kind,
    eventType: "CREATED",
    dueAt: { $gte: now, $lte: end }
  }).lean();

  for (const ce of created) {

    const accepted = await WorkEvent.findOne({
      kind,
      refId: ce.refId,
      eventType: "ACCEPTED"
    });

    if (accepted) continue;

    const view = await buildView(kind, ce.refId);

    items.push({
      ...view,
      deadlineType: "ACCEPT_DEADLINE"
    });

  }

  const accepted = await WorkEvent.find({
    kind,
    eventType: "ACCEPTED",
    dueAt: { $gte: now, $lte: end }
  }).lean();

  for (const ae of accepted) {

    const completed = await WorkEvent.findOne({
      kind,
      refId: ae.refId,
      eventType: "COMPLETED"
    });

    if (completed) continue;

    const view = await buildView(kind, ae.refId);

    items.push({
      ...view,
      deadlineType: "COMPLETE_DEADLINE"
    });

  }

  return items;
}

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