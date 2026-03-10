import { Router } from "express";
import assignToResolver from "../controllers/adminaction.controller";


const router = Router();

router.post("/assign/resolver" , assignToResolver )

export default router;