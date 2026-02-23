import { Router } from "express";
import { addMessage, getMessages } from "../controllers/discussion.controller";

const router = Router();

router.get("/:kind/:id", getMessages);
router.post("/:kind/:id/message", addMessage);

export default router;