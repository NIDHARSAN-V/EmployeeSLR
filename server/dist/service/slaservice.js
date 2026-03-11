"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsForAdmin = notificationsForAdmin;
exports.slaBreached = slaBreached;
exports.notificationsForResolver = notificationsForResolver;
exports.slaNear = slaNear;
exports.upsertAcceptBreach = upsertAcceptBreach;
exports.upsertCompleteBreach = upsertCompleteBreach;
const resource_model_1 = require("../models/resource.model");
const resourceservice_1 = require("./resourceservice");
async function notificationsForAdmin(isNear) {
    const { now, end } = (0, resourceservice_1.nearRange)();
    const dueFilter = isNear ? { $gte: now, $lte: end } : { $lt: now };
    const nowMs = now.getTime();
    const items = [];
    for (const kind of ["ticket", "asset"]) {
        // A) pending accept: CREATED dueAt and no ACCEPTED
        const createdDue = await resource_model_1.WorkEvent.find({ kind, eventType: "CREATED", dueAt: dueFilter }).lean();
        for (const ce of createdDue) {
            const accepted = await resource_model_1.WorkEvent.findOne({ kind, refId: ce.refId, eventType: "ACCEPTED" }).lean();
            if (accepted)
                continue;
            const view = await (0, resourceservice_1.buildView)(kind, ce.refId);
            items.push({
                ...view,
                deadlineType: "ACCEPT_DEADLINE",
                minutesLeft: ce.dueAt ? Math.ceil((ce.dueAt.getTime() - nowMs) / 60000) : null,
                isOverdue: ce.dueAt ? ce.dueAt.getTime() < nowMs : null,
            });
        }
        const acceptedDue = await resource_model_1.WorkEvent.find({ kind, eventType: "ACCEPTED", dueAt: dueFilter }).lean();
        for (const ae of acceptedDue) {
            const completed = await resource_model_1.WorkEvent.findOne({ kind, refId: ae.refId, eventType: "COMPLETED" }).lean();
            if (completed)
                continue;
            const view = await (0, resourceservice_1.buildView)(kind, ae.refId);
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
async function slaBreached(kind) {
    const now = new Date();
    const items = [];
    // ACCEPT DEADLINE BREACHED
    const created = await resource_model_1.WorkEvent.find({
        kind,
        eventType: "CREATED",
        dueAt: { $lt: now }
    }).lean();
    for (const ce of created) {
        const accepted = await resource_model_1.WorkEvent.findOne({
            kind,
            refId: ce.refId,
            eventType: "ACCEPTED"
        });
        if (accepted)
            continue;
        const view = await (0, resourceservice_1.buildView)(kind, ce.refId);
        items.push({
            ...view,
            eventId: ce._id,
            deadlineType: "ACCEPT_DEADLINE",
            isOverdue: true
        });
    }
    // COMPLETE DEADLINE BREACHED
    const accepted = await resource_model_1.WorkEvent.find({
        kind,
        eventType: "ACCEPTED",
        dueAt: { $lt: now }
    }).lean();
    for (const ae of accepted) {
        const completed = await resource_model_1.WorkEvent.findOne({
            kind,
            refId: ae.refId,
            eventType: "COMPLETED"
        });
        if (completed)
            continue;
        const view = await (0, resourceservice_1.buildView)(kind, ae.refId);
        items.push({
            ...view,
            eventId: ae._id,
            deadlineType: "COMPLETE_DEADLINE",
            isOverdue: true
        });
    }
    return items;
}
async function notificationsForResolver(userId, isNear) {
    const { now, end } = (0, resourceservice_1.nearRange)();
    const dueFilter = isNear ? { $gte: now, $lte: end } : { $lt: now };
    const nowMs = now.getTime();
    const items = [];
    for (const kind of ["ticket", "asset"]) {
        const acceptedDue = await resource_model_1.WorkEvent.find({ kind, eventType: "ACCEPTED", dueAt: dueFilter }).lean();
        for (const ae of acceptedDue) {
            const actor = await resource_model_1.WorkEventActor.findOne({
                eventId: ae._id,
                role: "accepted_by",
                userId,
            }).lean();
            if (!actor)
                continue;
            const completed = await resource_model_1.WorkEvent.findOne({ kind, refId: ae.refId, eventType: "COMPLETED" }).lean();
            if (completed)
                continue;
            const view = await (0, resourceservice_1.buildView)(kind, ae.refId);
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
async function slaNear(kind) {
    const now = new Date();
    const end = new Date(now.getTime() + (0, resourceservice_1.minutesToMs)(resourceservice_1.NEAR_DUE_MIN));
    const items = [];
    const created = await resource_model_1.WorkEvent.find({
        kind,
        eventType: "CREATED",
        dueAt: { $gte: now, $lte: end }
    }).lean();
    for (const ce of created) {
        const accepted = await resource_model_1.WorkEvent.findOne({
            kind,
            refId: ce.refId,
            eventType: "ACCEPTED"
        });
        if (accepted)
            continue;
        const view = await (0, resourceservice_1.buildView)(kind, ce.refId);
        items.push({
            ...view,
            deadlineType: "ACCEPT_DEADLINE"
        });
    }
    const accepted = await resource_model_1.WorkEvent.find({
        kind,
        eventType: "ACCEPTED",
        dueAt: { $gte: now, $lte: end }
    }).lean();
    for (const ae of accepted) {
        const completed = await resource_model_1.WorkEvent.findOne({
            kind,
            refId: ae.refId,
            eventType: "COMPLETED"
        });
        if (completed)
            continue;
        const view = await (0, resourceservice_1.buildView)(kind, ae.refId);
        items.push({
            ...view,
            deadlineType: "COMPLETE_DEADLINE"
        });
    }
    return items;
}
async function upsertAcceptBreach(kind, refId, dueAt) {
    await resource_model_1.SlaAcceptBreach.updateOne({ kind, refId }, { $setOnInsert: { kind, refId, dueAt, breachedAt: new Date() } }, { upsert: true });
}
async function upsertCompleteBreach(kind, refId, dueAt) {
    await resource_model_1.SlaCompleteBreach.updateOne({ kind, refId }, { $setOnInsert: { kind, refId, dueAt, breachedAt: new Date() } }, { upsert: true });
}
