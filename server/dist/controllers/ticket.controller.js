"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTicketsByStatus = exports.getTicketsSolvedByUser = exports.getTicketsAcceptedByUser = exports.getTicketsRaisedByUser = exports.getTicketById = exports.listTickets = exports.completeTicket = exports.acceptTicket = exports.createTicket = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const resource_model_1 = require("../models/resource.model");
const resourceservice_1 = require("../service/resourceservice");
const createTicket = async (req, res) => {
    const { request_type, raised_by } = req.body;
    if (typeof request_type !== "string" || !request_type.trim())
        return res.status(400).json({ message: "request_type is required" });
    if (!(0, resourceservice_1.isValidObjectId)(raised_by))
        return res.status(400).json({ message: "Invalid raised_by" });
    const role = await (0, resourceservice_1.getRole)(raised_by);
    if (!role)
        return res.status(404).json({ message: "User not found" });
    if (role !== "EMPLOYEE")
        return res.status(403).json({ message: "Only EMPLOYEE can create tickets" });
    const ticket = await resource_model_1.Ticket.create({ request_type: request_type.trim() });
    const createdAt = new Date();
    const dueAt = new Date(createdAt.getTime() + (0, resourceservice_1.minutesToMs)(resourceservice_1.ACCEPT_SLA_MIN));
    const ev = await resource_model_1.WorkEvent.create({
        kind: "ticket",
        refId: ticket._id,
        eventType: "CREATED",
        occurredAt: createdAt,
        dueAt,
    });
    await resource_model_1.WorkEventActor.create({ eventId: ev._id, userId: raised_by, role: "raised_by" });
    // create empty discussion thread
    await (0, resourceservice_1.ensureDiscussion)("ticket", ticket._id);
    return res.status(201).json(await (0, resourceservice_1.buildView)("ticket", ticket._id));
};
exports.createTicket = createTicket;
const acceptTicket = async (req, res) => {
    const ticketId = req.params.id;
    const { accepted_by } = req.body;
    if (!(0, resourceservice_1.isValidObjectId)(ticketId))
        return res.status(400).json({ message: "Invalid ticket ID" });
    if (!(0, resourceservice_1.isValidObjectId)(accepted_by))
        return res.status(400).json({ message: "Invalid accepted_by" });
    const role = await (0, resourceservice_1.getRole)(accepted_by);
    if (!role)
        return res.status(404).json({ message: "User not found" });
    if (role !== "RESOLVER")
        return res.status(403).json({ message: "Only RESOLVER can accept tickets" });
    const ticket = await resource_model_1.Ticket.findById(ticketId).lean();
    if (!ticket)
        return res.status(404).json({ message: "Ticket not found" });
    const alreadyAccepted = await resource_model_1.WorkEvent.findOne({ kind: "ticket", refId: ticketId, eventType: "ACCEPTED" }).lean();
    if (alreadyAccepted)
        return res.status(409).json({ message: "Ticket already accepted" });
    const acceptedAt = new Date();
    const dueAt = new Date(acceptedAt.getTime() + (0, resourceservice_1.minutesToMs)(resourceservice_1.COMPLETE_SLA_MIN));
    const ev = await resource_model_1.WorkEvent.create({
        kind: "ticket",
        refId: new mongoose_1.default.Types.ObjectId(ticketId),
        eventType: "ACCEPTED",
        occurredAt: acceptedAt,
        dueAt,
    });
    await resource_model_1.WorkEventActor.create({ eventId: ev._id, userId: accepted_by, role: "accepted_by" });
    return res.json(await (0, resourceservice_1.buildView)("ticket", new mongoose_1.default.Types.ObjectId(ticketId)));
};
exports.acceptTicket = acceptTicket;
const completeTicket = async (req, res) => {
    const ticketId = req.params.id;
    const { completed_by } = req.body;
    if (!(0, resourceservice_1.isValidObjectId)(ticketId))
        return res.status(400).json({ message: "Invalid ticket ID" });
    if (!(0, resourceservice_1.isValidObjectId)(completed_by))
        return res.status(400).json({ message: "Invalid completed_by" });
    const role = await (0, resourceservice_1.getRole)(completed_by);
    if (!role)
        return res.status(404).json({ message: "User not found" });
    if (role !== "RESOLVER")
        return res.status(403).json({ message: "Only RESOLVER can complete tickets" });
    const ticket = await resource_model_1.Ticket.findById(ticketId).lean();
    if (!ticket)
        return res.status(404).json({ message: "Ticket not found" });
    const accepted = await resource_model_1.WorkEvent.findOne({ kind: "ticket", refId: ticketId, eventType: "ACCEPTED" }).lean();
    if (!accepted)
        return res.status(409).json({ message: "Ticket must be accepted before completing" });
    const alreadyCompleted = await resource_model_1.WorkEvent.findOne({ kind: "ticket", refId: ticketId, eventType: "COMPLETED" }).lean();
    if (alreadyCompleted)
        return res.status(409).json({ message: "Ticket already completed" });
    const ev = await resource_model_1.WorkEvent.create({
        kind: "ticket",
        refId: new mongoose_1.default.Types.ObjectId(ticketId),
        eventType: "COMPLETED",
        occurredAt: new Date(),
        dueAt: null,
    });
    await resource_model_1.WorkEventActor.create({ eventId: ev._id, userId: completed_by, role: "completed_by" });
    return res.json(await (0, resourceservice_1.buildView)("ticket", new mongoose_1.default.Types.ObjectId(ticketId)));
};
exports.completeTicket = completeTicket;
//get tickets
const listTickets = async (_, res) => {
    try {
        const tickets = await resource_model_1.Ticket.find().sort({ _id: -1 }).lean();
        const views = await Promise.all(tickets.map((t) => (0, resourceservice_1.buildView)("ticket", t._id)));
        return res.json(views);
    }
    catch (e) {
        return res.status(500).json({ message: "Server error" });
    }
};
exports.listTickets = listTickets;
const getTicketById = async (req, res) => {
    const id = req.params.id;
    if (!(0, resourceservice_1.isValidObjectId)(id))
        return res.status(400).json({ message: "Invalid ticket ID" });
    const ticket = await resource_model_1.Ticket.findById(id).lean();
    if (!ticket)
        return res.status(404).json({ message: "Ticket not found" });
    return res.json(await (0, resourceservice_1.buildView)("ticket", new mongoose_1.default.Types.ObjectId(id)));
};
exports.getTicketById = getTicketById;
const getTicketsRaisedByUser = async (req, res) => {
    const userId = req.params.userId;
    if (!(0, resourceservice_1.isValidObjectId)(userId))
        return res.status(400).json({ message: "Invalid userId" });
    const created = await resource_model_1.WorkEvent.find({ kind: "ticket", eventType: "CREATED" }).lean();
    const out = [];
    for (const ev of created) {
        const actor = await resource_model_1.WorkEventActor.findOne({ eventId: ev._id, role: "raised_by", userId }).lean();
        if (!actor)
            continue;
        out.push(await (0, resourceservice_1.buildView)("ticket", ev.refId));
    }
    return res.json(out);
};
exports.getTicketsRaisedByUser = getTicketsRaisedByUser;
const getTicketsAcceptedByUser = async (req, res) => {
    const userId = req.params.userId;
    if (!(0, resourceservice_1.isValidObjectId)(userId))
        return res.status(400).json({ message: "Invalid userId" });
    const accepted = await resource_model_1.WorkEvent.find({ kind: "ticket", eventType: "ACCEPTED" }).lean();
    const out = [];
    for (const ev of accepted) {
        const actor = await resource_model_1.WorkEventActor.findOne({ eventId: ev._id, role: "accepted_by", userId }).lean();
        if (!actor)
            continue;
        out.push(await (0, resourceservice_1.buildView)("ticket", ev.refId));
    }
    return res.json(out);
};
exports.getTicketsAcceptedByUser = getTicketsAcceptedByUser;
const getTicketsSolvedByUser = async (req, res) => {
    const userId = req.params.userId;
    if (!(0, resourceservice_1.isValidObjectId)(userId))
        return res.status(400).json({ message: "Invalid userId" });
    const completed = await resource_model_1.WorkEvent.find({ kind: "ticket", eventType: "COMPLETED" }).lean();
    const out = [];
    for (const ev of completed) {
        const actor = await resource_model_1.WorkEventActor.findOne({ eventId: ev._id, role: "completed_by", userId }).lean();
        if (!actor)
            continue;
        out.push(await (0, resourceservice_1.buildView)("ticket", ev.refId));
    }
    return res.json(out);
};
exports.getTicketsSolvedByUser = getTicketsSolvedByUser;
const getTicketsByStatus = async (req, res) => {
    const status = req.params.status;
    if (!(0, resourceservice_1.isValidStatus)(status))
        return res.status(400).json({ message: "Invalid status" });
    const tickets = await resource_model_1.Ticket.find().lean();
    const out = [];
    for (const t of tickets) {
        const view = await (0, resourceservice_1.buildView)("ticket", t._id);
        if (view.status === status)
            out.push(view);
    }
    return res.json(out);
};
exports.getTicketsByStatus = getTicketsByStatus;
