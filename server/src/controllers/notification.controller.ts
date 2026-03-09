import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  isValidObjectId,
  getRole,
  notificationsForAdmin,
  notificationsForResolver,
  upsertAcceptBreach,
  upsertCompleteBreach,
} from "../service/resourceservice";

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