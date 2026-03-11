"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.minutesToMs = exports.NEAR_DUE_MIN = exports.COMPLETE_SLA_MIN = exports.ACCEPT_SLA_MIN = void 0;
exports.isValidObjectId = isValidObjectId;
exports.isValidStatus = isValidStatus;
exports.nearRange = nearRange;
exports.getRole = getRole;
exports.ensureDiscussion = ensureDiscussion;
exports.getCore = getCore;
exports.buildView = buildView;
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("../models/user.model");
const resource_model_1 = require("../models/resource.model");
//  ENV 
exports.ACCEPT_SLA_MIN = Number(process.env.ACCEPT_SLA_MIN ?? 2);
exports.COMPLETE_SLA_MIN = Number(process.env.COMPLETE_SLA_MIN ?? 2);
exports.NEAR_DUE_MIN = Number(process.env.NEAR_DUE_MIN ?? 1);
const minutesToMs = (m) => m * 60 * 1000;
exports.minutesToMs = minutesToMs;
function isValidObjectId(id) {
    return typeof id === "string" && mongoose_1.default.Types.ObjectId.isValid(id);
}
function isValidStatus(s) {
    return s === "pending" || s === "accepted" || s === "completed";
}
function nearRange() {
    const now = new Date();
    const end = new Date(now.getTime() + (0, exports.minutesToMs)(exports.NEAR_DUE_MIN));
    return { now, end };
}
async function getRole(userId) {
    const u = await user_model_1.User.findById(userId).select("role").lean();
    return u?.role ?? null;
}
async function ensureDiscussion(kind, refId) {
    const exists = await resource_model_1.Discussion.findOne({ kind, refId }).select("_id").lean();
    if (!exists)
        await resource_model_1.Discussion.create({ kind, refId, messages: [] });
}
async function getCore(kind, refId) {
    return kind === "ticket" ? resource_model_1.Ticket.findById(refId).lean() : resource_model_1.Asset.findById(refId).lean();
}
// buildView (NO discussion included) 
async function buildView(kind, refId) {
    const [core, created, accepted, completed] = await Promise.all([
        getCore(kind, refId),
        resource_model_1.WorkEvent.findOne({ kind, refId, eventType: "CREATED" }).lean(),
        resource_model_1.WorkEvent.findOne({ kind, refId, eventType: "ACCEPTED" }).lean(),
        resource_model_1.WorkEvent.findOne({ kind, refId, eventType: "COMPLETED" }).lean(),
    ]);
    const status = completed ? "completed" : accepted ? "accepted" : "pending";
    const createdActor = created
        ? await resource_model_1.WorkEventActor.findOne({ eventId: created._id, role: "raised_by" }).lean()
        : null;
    const acceptedActor = accepted
        ? await resource_model_1.WorkEventActor.findOne({ eventId: accepted._id, role: "accepted_by" }).lean()
        : null;
    const completedActor = completed
        ? await resource_model_1.WorkEventActor.findOne({ eventId: completed._id, role: "completed_by" }).lean()
        : null;
    return {
        kind,
        refId,
        request_type: core?.request_type ?? null,
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
