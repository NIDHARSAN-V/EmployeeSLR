import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  isValidObjectId,
  getRole,
} from "../service/resourceservice";

import{
  notificationsForAdmin,
  notificationsForResolver,
  slaBreached,
  slaNear,
  upsertAcceptBreach,
  upsertCompleteBreach,
} from "../service/slaservice";


export const notificationForDeadline = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  if (!isValidObjectId(userId)) return res.status(400).json({ message: "Invalid userId" });

  const role = await getRole(userId);
  if (!role) return res.status(404).json({ message: "User not found" });

  const items =
    role === "ADMIN"
      ? await notificationsForAdmin(true)
      : role === "RESOLVER"
      ? await notificationsForResolver(userId, true)
      : [];

  return res.json({ mode: "NEAR_DEADLINE", role, items });
};


export const notificationForTimeEnded = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  if (!isValidObjectId(userId)) return res.status(400).json({ message: "Invalid userId" });

  const role = await getRole(userId);
  if (!role) return res.status(404).json({ message: "User not found" });

  const items =
    role === "ADMIN"
      ? await notificationsForAdmin(false)
      : role === "RESOLVER"
      ? await notificationsForResolver(userId, false)
      : [];

  // ✅ Update SLA breach DB ONLY here (no duplicates due to unique index + upsert)
  for (const it of items) {
    const refId = new mongoose.Types.ObjectId(it.refId);

    if (it.deadlineType === "ACCEPT_DEADLINE" && it.acceptDueAt) {
      await upsertAcceptBreach(it.kind, refId, new Date(it.acceptDueAt));
    }
    if (it.deadlineType === "COMPLETE_DEADLINE" && it.completeDueAt) {
      await upsertCompleteBreach(it.kind, refId, new Date(it.completeDueAt));
    }
  }

  return res.json({ mode: "OVERDUE", role, items });
};





export const slaBreachedTickets = async (req: Request, res: Response) => {
  const items = await slaBreached("ticket");
  return res.json({ type: "ticket", mode: "BREACHED", items });
};

export const slaBreachedAssets = async (req: Request, res: Response) => {
  const items = await slaBreached("asset");
  return res.json({ type: "asset", mode: "BREACHED", items });
};

export const slaNearTickets = async (req: Request, res: Response) => {
  const items = await slaNear("ticket");
  return res.json({ type: "ticket", mode: "NEAR", items });
};

export const slaNearAssets = async (req: Request, res: Response) => {
  const items = await slaNear("asset");
  return res.json({ type: "asset", mode: "NEAR", items });
};


