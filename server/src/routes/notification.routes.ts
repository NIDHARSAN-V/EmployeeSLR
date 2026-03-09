import { Router } from "express";
import { notificationForDeadline, notificationForTimeEnded, slaBreachedAssets, slaBreachedTickets, slaNearAssets, slaNearTickets,  } from "../controllers/notification.controller";





const router = Router();

router.get("/deadline/:userId", notificationForDeadline);
router.get("/ended/:userId", notificationForTimeEnded);

router.get("/sla-breached/tickets", slaBreachedTickets);
router.get("/sla-breached/assets", slaBreachedAssets);

router.get("/sla-near/tickets", slaNearTickets);
router.get("/sla-near/assets", slaNearAssets);

export default router;
