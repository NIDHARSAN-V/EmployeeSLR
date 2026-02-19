import { Request, Response } from "express";
import Ticket from "../models/ticket.model";
import {User} from "../models/user.model";
import mongoose from "mongoose";
import { Types } from "mongoose";


function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export const createTicket = async (req: Request, res: Response) => {
  const { type, request_type, raised_by } = req.body;

  if (!isValidObjectId(raised_by)) {
    return res.status(400).json({ message: "Invalid raised_by ID" });
  }

  const user = await User.findById(raised_by);
  if (!user) return res.status(404).json({ message: "Raised By user not found" });

  if (user.role !== "EMPLOYEE") {
    return res.status(403).json({ message: "Only EMPLOYEE role can create tickets" });
  }

  const ticket = await Ticket.create({ type, request_type, raised_by });
  res.status(201).json(ticket);
};




export const acceptTicket = async (req: Request, res: Response) => {
  const { accepted_by } = req.body;
  const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!isValidObjectId(accepted_by)) {
    return res.status(400).json({ message: "Invalid accepted_by ID" });
  }

  const user = await User.findById(accepted_by);
  if (!user) return res.status(404).json({ message: "Accepted By user not found" });

  if (user.role !== "RESOLVER") {
    return res.status(403).json({ message: "Only RESOLVER role can accept tickets" });
  }

  if (!isValidObjectId( ticketId)) {
    return res.status(400).json({ message: "Invalid ticket ID" });
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  ticket.accepted_by = accepted_by;
  ticket.acceptedAt = new Date();
  ticket.status = "accepted";

  await ticket.save();
  res.json(ticket);
};

export const completeTicket = async (req: Request, res: Response) => {
  const { completed_by } = req.body;
  const ticketId =  Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!isValidObjectId(completed_by)) {
    return res.status(400).json({ message: "Invalid completed_by ID" });
  }

  const user = await User.findById(completed_by);
  if (!user) return res.status(404).json({ message: "Completed By user not found" });

  if (user.role !== "RESOLVER") {
    return res.status(403).json({ message: "Only RESOLVER role can complete tickets" });
  }

  if (!isValidObjectId(ticketId)) {
    return res.status(400).json({ message: "Invalid ticket ID" });
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  ticket.completed_by = completed_by;
  ticket.completedAt = new Date();
  ticket.status = "completed";

  await ticket.save();
  res.json(ticket);
};



export const listTickets = async (_: Request, res: Response) => {
  const tickets = await Ticket.find().sort({ createdAt: -1 });
  res.json(tickets);
};

export const getTicketsRaisedByUser = async (req: Request, res: Response) => {
  const userId =req.params.userId

  const user = await User.findById(userId);
  console.log(user)
  if (!user) return res.status(400).json({ message: "User not found" });

  const tickets = await Ticket.find({ raised_by: userId });

  res.json(tickets);
};


export const getTicketsSolvedByUser = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const tickets = await Ticket.find({ completed_by: userId });

  res.json(tickets);
};


export const getTicketsByStatus = async (
  req: Request<{ status: "pending" | "accepted" | "completed" }>,
  res: Response
) => {
  try {
    const { status } = req.params;

    const tickets = await Ticket.find({ status });

    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};



