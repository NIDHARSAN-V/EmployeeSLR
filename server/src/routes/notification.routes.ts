import { Router } from "express";
import { notificationForDeadline, notificationForTimeEnded } from "../controllers/notification.controller";

const router = Router();

router.get("/deadline/:userId", notificationForDeadline);
router.get("/ended/:userId", notificationForTimeEnded);

export default router;