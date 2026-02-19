import { Router } from "express";
import {
  createTicket,
  listTickets,
  acceptTicket,
  completeTicket,
  getTicketsRaisedByUser,
  getTicketsSolvedByUser,
  getTicketsByStatus
} from "../controllers/ticket.controller";

const router = Router();

router.post("/", createTicket);
router.get("/", listTickets);
router.post("/:id/accept", acceptTicket);
router.post("/:id/complete", completeTicket);
router.get("/raised/:userId", getTicketsRaisedByUser);
router.get("/solved/:userId", getTicketsSolvedByUser);
router.get("/status/:status", getTicketsByStatus);

export default router;
