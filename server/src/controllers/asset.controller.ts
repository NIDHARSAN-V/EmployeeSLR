import { Request, Response } from "express";
import mongoose from "mongoose";
import { Asset, WorkEvent, WorkEventActor } from "../models/resource.model";
import {
  ACCEPT_SLA_MIN,
  COMPLETE_SLA_MIN,
  minutesToMs,
  isValidObjectId,
  isValidStatus,
  getRole,
  buildView,
} from "../service/resourceservice";

export const createAsset = async (req: Request, res: Response) => {
  const { request_type, raised_by } = req.body;

  if (typeof request_type !== "string" || !request_type.trim())
    return res.status(400).json({ message: "request_type is required" });

  if (!isValidObjectId(raised_by))
    return res.status(400).json({ message: "Invalid raised_by" });

  const role = await getRole(raised_by);
  if (!role) return res.status(404).json({ message: "User not found" });
  if (role !== "EMPLOYEE") return res.status(403).json({ message: "Only EMPLOYEE can create assets" });

  const asset = await Asset.create({ request_type: request_type.trim() });

  const createdAt = new Date();
  const dueAt = new Date(createdAt.getTime() + minutesToMs(ACCEPT_SLA_MIN));

  const ev = await WorkEvent.create({
    kind: "asset",
    refId: asset._id,
    eventType: "CREATED",
    occurredAt: createdAt,
    dueAt,
  });

  await WorkEventActor.create({ eventId: ev._id, userId: raised_by, role: "raised_by" });

  return res.status(201).json(await buildView("asset", asset._id));
};

export const acceptAsset = async (req: Request, res: Response) => {
  const assetId = req.params.id;
  const { accepted_by } = req.body;

  if (!isValidObjectId(assetId)) return res.status(400).json({ message: "Invalid asset ID" });
  if (!isValidObjectId(accepted_by)) return res.status(400).json({ message: "Invalid accepted_by" });

  const role = await getRole(accepted_by);
  if (!role) return res.status(404).json({ message: "User not found" });
  if (role !== "RESOLVER") return res.status(403).json({ message: "Only RESOLVER can accept assets" });

  const asset = await Asset.findById(assetId).lean();
  if (!asset) return res.status(404).json({ message: "Asset not found" });

  const alreadyAccepted = await WorkEvent.findOne({ kind: "asset", refId: assetId, eventType: "ACCEPTED" }).lean();
  if (alreadyAccepted) return res.status(409).json({ message: "Asset already accepted" });

  const acceptedAt = new Date();
  const dueAt = new Date(acceptedAt.getTime() + minutesToMs(COMPLETE_SLA_MIN));

  const ev = await WorkEvent.create({
    kind: "asset",
    refId: assetId,
    eventType: "ACCEPTED",
    occurredAt: acceptedAt,
    dueAt,
  });

  await WorkEventActor.create({ eventId: ev._id, userId: accepted_by, role: "accepted_by" });

  return res.json(await buildView("asset", new mongoose.Types.ObjectId(assetId)));
};

export const completeAsset = async (req: Request, res: Response) => {
  const assetId = req.params.id;
  const { completed_by } = req.body;

  if (!isValidObjectId(assetId)) return res.status(400).json({ message: "Invalid asset ID" });
  if (!isValidObjectId(completed_by)) return res.status(400).json({ message: "Invalid completed_by" });

  const role = await getRole(completed_by);
  if (!role) return res.status(404).json({ message: "User not found" });
  if (role !== "RESOLVER") return res.status(403).json({ message: "Only RESOLVER can complete assets" });

  const asset = await Asset.findById(assetId).lean();
  if (!asset) return res.status(404).json({ message: "Asset not found" });

  const accepted = await WorkEvent.findOne({ kind: "asset", refId: assetId, eventType: "ACCEPTED" }).lean();
  if (!accepted) return res.status(409).json({ message: "Asset must be accepted before completing" });

  const alreadyCompleted = await WorkEvent.findOne({ kind: "asset", refId: assetId, eventType: "COMPLETED" }).lean();
  if (alreadyCompleted) return res.status(409).json({ message: "Asset already completed" });

  const ev = await WorkEvent.create({
    kind: "asset",
    refId: assetId,
    eventType: "COMPLETED",
    occurredAt: new Date(),
    dueAt: null,
  });

  await WorkEventActor.create({ eventId: ev._id, userId: completed_by, role: "completed_by" });

  return res.json(await buildView("asset", new mongoose.Types.ObjectId(assetId)));
};

export const listAssets = async (_: Request, res: Response) => {
  try {
    const assets = await Asset.find().sort({ _id: -1 }).lean();

    const views = await Promise.all(
      assets.map((a) =>
        buildView("asset", a._id)
      )
    );

    return res.json(views);
  } catch (error) {
    console.error("listAssets error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const getAssetsRaisedByUser = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  if (!isValidObjectId(userId)) return res.status(400).json({ message: "Invalid userId" });

  const created = await WorkEvent.find({ kind: "asset", eventType: "CREATED" }).lean();
  const out: any[] = [];

  for (const ev of created) {
    const actor = await WorkEventActor.findOne({ eventId: ev._id, role: "raised_by", userId }).lean();
    if (!actor) continue;
    out.push(await buildView("asset", ev.refId));
  }

  return res.json(out);
};

export const getAssetsSolvedByUser = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  if (!isValidObjectId(userId)) return res.status(400).json({ message: "Invalid userId" });

  const completed = await WorkEvent.find({ kind: "asset", eventType: "COMPLETED" }).lean();
  const out: any[] = [];

  for (const ev of completed) {
    const actor = await WorkEventActor.findOne({ eventId: ev._id, role: "completed_by", userId }).lean();
    if (!actor) continue;
    out.push(await buildView("asset", ev.refId));
  }

  return res.json(out);
};

export const getAssetsByStatus = async (req: Request, res: Response) => {
  const status = req.params.status;
  if (!isValidStatus(status)) return res.status(400).json({ message: "Invalid status" });

  const assets = await Asset.find().lean();
  const out: any[] = [];

  for (const a of assets) {
    const view = await buildView("asset", a._id);
    if (view.status === status) out.push(view);
  }

  return res.json(out);
};