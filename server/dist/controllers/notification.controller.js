"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.slaNearAssets = exports.slaNearTickets = exports.slaBreachedAssets = exports.slaBreachedTickets = exports.notificationForTimeEnded = exports.notificationForDeadline = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const resourceservice_1 = require("../service/resourceservice");
const slaservice_1 = require("../service/slaservice");
const notificationForDeadline = async (req, res) => {
    const userId = req.params.userId;
    if (!(0, resourceservice_1.isValidObjectId)(userId))
        return res.status(400).json({ message: "Invalid userId" });
    const role = await (0, resourceservice_1.getRole)(userId);
    if (!role)
        return res.status(404).json({ message: "User not found" });
    const items = role === "ADMIN"
        ? await (0, slaservice_1.notificationsForAdmin)(true)
        : role === "RESOLVER"
            ? await (0, slaservice_1.notificationsForResolver)(userId, true)
            : [];
    return res.json({ mode: "NEAR_DEADLINE", role, items });
};
exports.notificationForDeadline = notificationForDeadline;
const notificationForTimeEnded = async (req, res) => {
    const userId = req.params.userId;
    if (!(0, resourceservice_1.isValidObjectId)(userId))
        return res.status(400).json({ message: "Invalid userId" });
    const role = await (0, resourceservice_1.getRole)(userId);
    if (!role)
        return res.status(404).json({ message: "User not found" });
    const items = role === "ADMIN"
        ? await (0, slaservice_1.notificationsForAdmin)(false)
        : role === "RESOLVER"
            ? await (0, slaservice_1.notificationsForResolver)(userId, false)
            : [];
    for (const it of items) {
        const refId = new mongoose_1.default.Types.ObjectId(it.refId);
        if (it.deadlineType === "ACCEPT_DEADLINE" && it.acceptDueAt) {
            await (0, slaservice_1.upsertAcceptBreach)(it.kind, refId, new Date(it.acceptDueAt));
        }
        if (it.deadlineType === "COMPLETE_DEADLINE" && it.completeDueAt) {
            await (0, slaservice_1.upsertCompleteBreach)(it.kind, refId, new Date(it.completeDueAt));
        }
    }
    return res.json({ mode: "OVERDUE", role, items });
};
exports.notificationForTimeEnded = notificationForTimeEnded;
const slaBreachedTickets = async (req, res) => {
    const items = await (0, slaservice_1.slaBreached)("ticket");
    return res.json(items);
};
exports.slaBreachedTickets = slaBreachedTickets;
const slaBreachedAssets = async (req, res) => {
    const items = await (0, slaservice_1.slaBreached)("asset");
    return res.json(items);
};
exports.slaBreachedAssets = slaBreachedAssets;
const slaNearTickets = async (req, res) => {
    const items = await (0, slaservice_1.slaNear)("ticket");
    return res.json(items);
};
exports.slaNearTickets = slaNearTickets;
const slaNearAssets = async (req, res) => {
    const items = await (0, slaservice_1.slaNear)("asset");
    return res.json(items);
};
exports.slaNearAssets = slaNearAssets;
