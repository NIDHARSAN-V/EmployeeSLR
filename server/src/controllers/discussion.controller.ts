import { Request, Response } from "express";
import mongoose from "mongoose";
import { Discussion } from "../models/resource.model";
import { isValidObjectId, getRole } from "../service/resourceservice";

function parseKind(k: any): "ticket" | "asset" | null {
  return k === "ticket" || k === "asset" ? k : null;
}

// GET /discussion/:kind/:id
export const getMessages = async (req: Request, res: Response) => {
  const kind = parseKind(req.params.kind);
  const id = req.params.id;

  if (!kind) return res.status(400).json({ message: "Invalid kind (ticket/asset)" });
  if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

  const refId = new mongoose.Types.ObjectId(id);
  const doc = await Discussion.findOne({ kind, refId }).lean();

  return res.json({ kind, refId, messages: doc?.messages ?? [] });
};

// POST /discussion/:kind/:id/message
export const addMessage = async (req: Request, res: Response) => {
  const kind = parseKind(req.params.kind);
  const id = req.params.id;

  const { userId, message } = req.body;

  if (!kind) return res.status(400).json({ message: "Invalid kind (ticket/asset)" });
  if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
  if (!isValidObjectId(userId)) return res.status(400).json({ message: "Invalid userId" });
  if (typeof message !== "string" || !message.trim()) return res.status(400).json({ message: "message required" });

  const role = await getRole(userId);
  if (!role) return res.status(404).json({ message: "User not found" });

  const refId = new mongoose.Types.ObjectId(id);

  // ensure doc exists
  await Discussion.updateOne(
    { kind, refId },
    { $setOnInsert: { kind, refId, messages: [] } },
    { upsert: true }
  );

  // push message
  await Discussion.updateOne(
    { kind, refId },
    { $push: { messages: { userId, message: message.trim(), createdAt: new Date() } } }
  );

  const doc = await Discussion.findOne({ kind, refId }).lean();
  return res.json({ kind, refId, messages: doc?.messages ?? [] });
};