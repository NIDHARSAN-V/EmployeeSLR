import { Request, Response } from "express";
import {
  isValidObjectId,
  getRole,
  notificationsForAdmin,
  notificationsForResolver,
} from "../service/resourceservice";

export const notificationForDeadline = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  if (!isValidObjectId(userId)) return res.status(400).json({ message: "Invalid userId" });

  const role = await getRole(userId);
  if (!role) return res.status(404).json({ message: "User not found" });

  if (role === "ADMIN") return res.json({ mode: "NEAR_DEADLINE", role, items: await notificationsForAdmin(true) });
  if (role === "RESOLVER") return res.json({ mode: "NEAR_DEADLINE", role, items: await notificationsForResolver(userId, true) });

  return res.json({ mode: "NEAR_DEADLINE", role, items: [] });
};

export const notificationForTimeEnded = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  if (!isValidObjectId(userId)) return res.status(400).json({ message: "Invalid userId" });

  const role = await getRole(userId);
  if (!role) return res.status(404).json({ message: "User not found" });

  if (role === "ADMIN") return res.json({ mode: "OVERDUE", role, items: await notificationsForAdmin(false) });
  if (role === "RESOLVER") return res.json({ mode: "OVERDUE", role, items: await notificationsForResolver(userId, false) });

  return res.json({ mode: "OVERDUE", role, items: [] });
};