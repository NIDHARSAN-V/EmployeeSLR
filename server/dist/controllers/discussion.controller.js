"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMessage = exports.getMessages = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const resource_model_1 = require("../models/resource.model");
const resourceservice_1 = require("../service/resourceservice");
function parseKind(k) {
    return k === "ticket" || k === "asset" ? k : null;
}
// GET /discussion/:kind/:id
const getMessages = async (req, res) => {
    const kind = parseKind(req.params.kind);
    const id = req.params.id;
    if (!kind)
        return res.status(400).json({ message: "Invalid kind (ticket/asset)" });
    if (!(0, resourceservice_1.isValidObjectId)(id))
        return res.status(400).json({ message: "Invalid id" });
    const refId = new mongoose_1.default.Types.ObjectId(id);
    const doc = await resource_model_1.Discussion.findOne({ kind, refId }).lean();
    return res.json({ kind, refId, messages: doc?.messages ?? [] });
};
exports.getMessages = getMessages;
// POST /discussion/:kind/:id/message
const addMessage = async (req, res) => {
    const kind = parseKind(req.params.kind);
    const id = req.params.id;
    const { userId, message } = req.body;
    if (!kind)
        return res.status(400).json({ message: "Invalid kind (ticket/asset)" });
    if (!(0, resourceservice_1.isValidObjectId)(id))
        return res.status(400).json({ message: "Invalid id" });
    if (!(0, resourceservice_1.isValidObjectId)(userId))
        return res.status(400).json({ message: "Invalid userId" });
    if (typeof message !== "string" || !message.trim())
        return res.status(400).json({ message: "message required" });
    const role = await (0, resourceservice_1.getRole)(userId);
    if (!role)
        return res.status(404).json({ message: "User not found" });
    const refId = new mongoose_1.default.Types.ObjectId(id);
    await resource_model_1.Discussion.updateOne({ kind, refId }, { $setOnInsert: { kind, refId, messages: [] } }, { upsert: true });
    await resource_model_1.Discussion.updateOne({ kind, refId }, { $push: { messages: { userId, message: message.trim(), createdAt: new Date() } } });
    const doc = await resource_model_1.Discussion.findOne({ kind, refId }).lean();
    return res.json({ kind, refId, messages: doc?.messages ?? [] });
};
exports.addMessage = addMessage;
