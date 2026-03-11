// server/src/routes/seed.routes.ts
import { Router } from "express";
import { seedDemo } from "../seed/seedDemo";

const router = Router();

// GET /seed – run demo seed, return result or error
router.get("/", async (req, res) => {
  try {
    const result = await seedDemo();
    res.json(result);
  } catch (err: any) {
    console.error("Seed error:", err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

export default router;