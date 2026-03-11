"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetsByStatus = exports.getAssetsSolvedByUser = exports.getAssetsAcceptedByUser = exports.getAssetsRaisedByUser = exports.getAssetById = exports.listAssets = exports.completeAsset = exports.acceptAsset = exports.createAsset = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const resource_model_1 = require("../models/resource.model");
const resourceservice_1 = require("../service/resourceservice");
const createAsset = async (req, res) => {
    const { request_type, raised_by } = req.body;
    if (typeof request_type !== "string" || !request_type.trim())
        return res.status(400).json({ message: "request_type is required" });
    if (!(0, resourceservice_1.isValidObjectId)(raised_by))
        return res.status(400).json({ message: "Invalid raised_by" });
    const role = await (0, resourceservice_1.getRole)(raised_by);
    if (!role)
        return res.status(404).json({ message: "User not found" });
    if (role !== "EMPLOYEE")
        return res.status(403).json({ message: "Only EMPLOYEE can create assets" });
    const asset = await resource_model_1.Asset.create({ request_type: request_type.trim() });
    const createdAt = new Date();
    const dueAt = new Date(createdAt.getTime() + (0, resourceservice_1.minutesToMs)(resourceservice_1.ACCEPT_SLA_MIN));
    const ev = await resource_model_1.WorkEvent.create({
        kind: "asset",
        refId: asset._id,
        eventType: "CREATED",
        occurredAt: createdAt,
        dueAt,
    });
    await resource_model_1.WorkEventActor.create({ eventId: ev._id, userId: raised_by, role: "raised_by" });
    await (0, resourceservice_1.ensureDiscussion)("asset", asset._id);
    return res.status(201).json(await (0, resourceservice_1.buildView)("asset", asset._id));
};
exports.createAsset = createAsset;
const acceptAsset = async (req, res) => {
    const assetId = req.params.id;
    const { accepted_by } = req.body;
    if (!(0, resourceservice_1.isValidObjectId)(assetId))
        return res.status(400).json({ message: "Invalid asset ID" });
    if (!(0, resourceservice_1.isValidObjectId)(accepted_by))
        return res.status(400).json({ message: "Invalid accepted_by" });
    const role = await (0, resourceservice_1.getRole)(accepted_by);
    if (!role)
        return res.status(404).json({ message: "User not found" });
    if (role !== "RESOLVER")
        return res.status(403).json({ message: "Only RESOLVER can accept assets" });
    const asset = await resource_model_1.Asset.findById(assetId).lean();
    if (!asset)
        return res.status(404).json({ message: "Asset not found" });
    const alreadyAccepted = await resource_model_1.WorkEvent.findOne({ kind: "asset", refId: assetId, eventType: "ACCEPTED" }).lean();
    if (alreadyAccepted)
        return res.status(409).json({ message: "Asset already accepted" });
    const acceptedAt = new Date();
    const dueAt = new Date(acceptedAt.getTime() + (0, resourceservice_1.minutesToMs)(resourceservice_1.COMPLETE_SLA_MIN));
    const ev = await resource_model_1.WorkEvent.create({
        kind: "asset",
        refId: new mongoose_1.default.Types.ObjectId(assetId),
        eventType: "ACCEPTED",
        occurredAt: acceptedAt,
        dueAt,
    });
    await resource_model_1.WorkEventActor.create({ eventId: ev._id, userId: accepted_by, role: "accepted_by" });
    return res.json(await (0, resourceservice_1.buildView)("asset", new mongoose_1.default.Types.ObjectId(assetId)));
};
exports.acceptAsset = acceptAsset;
const completeAsset = async (req, res) => {
    const assetId = req.params.id;
    const { completed_by } = req.body;
    if (!(0, resourceservice_1.isValidObjectId)(assetId))
        return res.status(400).json({ message: "Invalid asset ID" });
    if (!(0, resourceservice_1.isValidObjectId)(completed_by))
        return res.status(400).json({ message: "Invalid completed_by" });
    const role = await (0, resourceservice_1.getRole)(completed_by);
    if (!role)
        return res.status(404).json({ message: "User not found" });
    if (role !== "RESOLVER")
        return res.status(403).json({ message: "Only RESOLVER can complete assets" });
    const asset = await resource_model_1.Asset.findById(assetId).lean();
    if (!asset)
        return res.status(404).json({ message: "Asset not found" });
    const accepted = await resource_model_1.WorkEvent.findOne({ kind: "asset", refId: assetId, eventType: "ACCEPTED" }).lean();
    if (!accepted)
        return res.status(409).json({ message: "Asset must be accepted before completing" });
    const alreadyCompleted = await resource_model_1.WorkEvent.findOne({ kind: "asset", refId: assetId, eventType: "COMPLETED" }).lean();
    if (alreadyCompleted)
        return res.status(409).json({ message: "Asset already completed" });
    const ev = await resource_model_1.WorkEvent.create({
        kind: "asset",
        refId: new mongoose_1.default.Types.ObjectId(assetId),
        eventType: "COMPLETED",
        occurredAt: new Date(),
        dueAt: null,
    });
    await resource_model_1.WorkEventActor.create({ eventId: ev._id, userId: completed_by, role: "completed_by" });
    return res.json(await (0, resourceservice_1.buildView)("asset", new mongoose_1.default.Types.ObjectId(assetId)));
};
exports.completeAsset = completeAsset;
//get asset
const listAssets = async (_, res) => {
    try {
        const assets = await resource_model_1.Asset.find().sort({ _id: -1 }).lean();
        const views = await Promise.all(assets.map((a) => (0, resourceservice_1.buildView)("asset", a._id)));
        return res.json(views);
    }
    catch {
        return res.status(500).json({ message: "Server error" });
    }
};
exports.listAssets = listAssets;
const getAssetById = async (req, res) => {
    const id = req.params.id;
    if (!(0, resourceservice_1.isValidObjectId)(id))
        return res.status(400).json({ message: "Invalid asset ID" });
    const asset = await resource_model_1.Asset.findById(id).lean();
    if (!asset)
        return res.status(404).json({ message: "Asset not found" });
    return res.json(await (0, resourceservice_1.buildView)("asset", new mongoose_1.default.Types.ObjectId(id)));
};
exports.getAssetById = getAssetById;
const getAssetsRaisedByUser = async (req, res) => {
    const userId = req.params.userId;
    if (!(0, resourceservice_1.isValidObjectId)(userId))
        return res.status(400).json({ message: "Invalid userId" });
    const created = await resource_model_1.WorkEvent.find({ kind: "asset", eventType: "CREATED" }).lean();
    const out = [];
    for (const ev of created) {
        const actor = await resource_model_1.WorkEventActor.findOne({ eventId: ev._id, role: "raised_by", userId }).lean();
        if (!actor)
            continue;
        out.push(await (0, resourceservice_1.buildView)("asset", ev.refId));
    }
    return res.json(out);
};
exports.getAssetsRaisedByUser = getAssetsRaisedByUser;
const getAssetsAcceptedByUser = async (req, res) => {
    const userId = req.params.userId;
    if (!(0, resourceservice_1.isValidObjectId)(userId))
        return res.status(400).json({ message: "Invalid userId" });
    const accepted = await resource_model_1.WorkEvent.find({ kind: "asset", eventType: "ACCEPTED" }).lean();
    const out = [];
    for (const ev of accepted) {
        const actor = await resource_model_1.WorkEventActor.findOne({ eventId: ev._id, role: "accepted_by", userId }).lean();
        if (!actor)
            continue;
        out.push(await (0, resourceservice_1.buildView)("asset", ev.refId));
    }
    return res.json(out);
};
exports.getAssetsAcceptedByUser = getAssetsAcceptedByUser;
const getAssetsSolvedByUser = async (req, res) => {
    const userId = req.params.userId;
    if (!(0, resourceservice_1.isValidObjectId)(userId))
        return res.status(400).json({ message: "Invalid userId" });
    const completed = await resource_model_1.WorkEvent.find({ kind: "asset", eventType: "COMPLETED" }).lean();
    const out = [];
    for (const ev of completed) {
        const actor = await resource_model_1.WorkEventActor.findOne({ eventId: ev._id, role: "completed_by", userId }).lean();
        if (!actor)
            continue;
        out.push(await (0, resourceservice_1.buildView)("asset", ev.refId));
    }
    return res.json(out);
};
exports.getAssetsSolvedByUser = getAssetsSolvedByUser;
const getAssetsByStatus = async (req, res) => {
    const status = req.params.status;
    if (!(0, resourceservice_1.isValidStatus)(status))
        return res.status(400).json({ message: "Invalid status" });
    const assets = await resource_model_1.Asset.find().lean();
    const out = [];
    for (const a of assets) {
        const view = await (0, resourceservice_1.buildView)("asset", a._id);
        if (view.status === status)
            out.push(view);
    }
    return res.json(out);
};
exports.getAssetsByStatus = getAssetsByStatus;
