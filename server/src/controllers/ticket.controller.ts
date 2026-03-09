import { Request, Response } from "express";
import mongoose from "mongoose";
import { Ticket, WorkEvent, WorkEventActor } from "../models/resource.model";
import {
  ACCEPT_SLA_MIN,
  COMPLETE_SLA_MIN,
  minutesToMs,
  isValidObjectId,
  isValidStatus,
  getRole,
  buildView,
  ensureDiscussion,
} from "../service/resourceservice";

export const createTicket = async (req: Request, res: Response) => {
  const { request_type, raised_by } = req.body;

  if (typeof request_type !== "string" || !request_type.trim())
    return res.status(400).json({ message: "request_type is required" });

  if (!isValidObjectId(raised_by))
    return res.status(400).json({ message: "Invalid raised_by" });

  const role = await getRole(raised_by);
  if (!role) return res.status(404).json({ message: "User not found" });
  if (role !== "EMPLOYEE") return res.status(403).json({ message: "Only EMPLOYEE can create tickets" });

  const ticket = await Ticket.create({ request_type: request_type.trim() });

  const createdAt = new Date();
  const dueAt = new Date(createdAt.getTime() + minutesToMs(ACCEPT_SLA_MIN));

  const ev = await WorkEvent.create({
    kind: "ticket",
    refId: ticket._id,
    eventType: "CREATED",
    occurredAt: createdAt,
    dueAt,
  });

  await WorkEventActor.create({ eventId: ev._id, userId: raised_by, role: "raised_by" });

  // create empty discussion thread
  await ensureDiscussion("ticket", ticket._id);

  return res.status(201).json(await buildView("ticket", ticket._id));
};

export const acceptTicket = async (req: Request, res: Response) => {
  const ticketId = req.params.id;
  const { accepted_by } = req.body;

  if (!isValidObjectId(ticketId)) return res.status(400).json({ message: "Invalid ticket ID" });
  if (!isValidObjectId(accepted_by)) return res.status(400).json({ message: "Invalid accepted_by" });

  const role = await getRole(accepted_by);
  if (!role) return res.status(404).json({ message: "User not found" });
  if (role !== "RESOLVER") return res.status(403).json({ message: "Only RESOLVER can accept tickets" });

  const ticket = await Ticket.findById(ticketId).lean();
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  const alreadyAccepted = await WorkEvent.findOne({ kind: "ticket", refId: ticketId, eventType: "ACCEPTED" }).lean();
  if (alreadyAccepted) return res.status(409).json({ message: "Ticket already accepted" });

  const acceptedAt = new Date();
  const dueAt = new Date(acceptedAt.getTime() + minutesToMs(COMPLETE_SLA_MIN));

  const ev = await WorkEvent.create({
    kind: "ticket",
    refId: new mongoose.Types.ObjectId(ticketId),
    eventType: "ACCEPTED",
    occurredAt: acceptedAt,
    dueAt,
  });

  await WorkEventActor.create({ eventId: ev._id, userId: accepted_by, role: "accepted_by" });

  return res.json(await buildView("ticket", new mongoose.Types.ObjectId(ticketId)));
};

export const completeTicket = async (req: Request, res: Response) => {
  const ticketId = req.params.id;
  const { completed_by } = req.body;

  if (!isValidObjectId(ticketId)) return res.status(400).json({ message: "Invalid ticket ID" });
  if (!isValidObjectId(completed_by)) return res.status(400).json({ message: "Invalid completed_by" });

  const role = await getRole(completed_by);
  if (!role) return res.status(404).json({ message: "User not found" });
  if (role !== "RESOLVER") return res.status(403).json({ message: "Only RESOLVER can complete tickets" });

  const ticket = await Ticket.findById(ticketId).lean();
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  const accepted = await WorkEvent.findOne({ kind: "ticket", refId: ticketId, eventType: "ACCEPTED" }).lean();
  if (!accepted) return res.status(409).json({ message: "Ticket must be accepted before completing" });

  const alreadyCompleted = await WorkEvent.findOne({ kind: "ticket", refId: ticketId, eventType: "COMPLETED" }).lean();
  if (alreadyCompleted) return res.status(409).json({ message: "Ticket already completed" });

  const ev = await WorkEvent.create({
    kind: "ticket",
    refId: new mongoose.Types.ObjectId(ticketId),
    eventType: "COMPLETED",
    occurredAt: new Date(),
    dueAt: null,
  });

  await WorkEventActor.create({ eventId: ev._id, userId: completed_by, role: "completed_by" });

  return res.json(await buildView("ticket", new mongoose.Types.ObjectId(ticketId)));
};

export const listTickets = async (_: Request, res: Response) => {
  try {
    const tickets = await Ticket.find().sort({ _id: -1 }).lean();
    const views = await Promise.all(tickets.map((t) => buildView("ticket", t._id)));
    return res.json(views);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTicketById = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid ticket ID" });

  const ticket = await Ticket.findById(id).lean();
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  return res.json(await buildView("ticket", new mongoose.Types.ObjectId(id)));
};

export const getTicketsRaisedByUser = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  if (!isValidObjectId(userId)) return res.status(400).json({ message: "Invalid userId" });

  const created = await WorkEvent.find({ kind: "ticket", eventType: "CREATED" }).lean();
  const out: any[] = [];

  for (const ev of created) {
    const actor = await WorkEventActor.findOne({ eventId: ev._id, role: "raised_by", userId }).lean();
    if (!actor) continue;
    out.push(await buildView("ticket", ev.refId));
  }

  return res.json(out);
};

export const getTicketsSolvedByUser = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  if (!isValidObjectId(userId)) return res.status(400).json({ message: "Invalid userId" });

  const completed = await WorkEvent.find({ kind: "ticket", eventType: "COMPLETED" }).lean();
  const out: any[] = [];

  for (const ev of completed) {
    const actor = await WorkEventActor.findOne({ eventId: ev._id, role: "completed_by", userId }).lean();
    if (!actor) continue;
    out.push(await buildView("ticket", ev.refId));
  }

  return res.json(out);
};

export const getTicketsByStatus = async (req: Request, res: Response) => {
  const status = req.params.status;
  if (!isValidStatus(status)) return res.status(400).json({ message: "Invalid status" });

  const tickets = await Ticket.find().lean();
  const out: any[] = [];

  for (const t of tickets) {
    const view = await buildView("ticket", t._id);
    if (view.status === status) out.push(view);
  }

  return res.json(out);
};