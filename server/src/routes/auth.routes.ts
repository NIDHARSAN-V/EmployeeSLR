import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { Role } from "../types/user.types";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// protected routes
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ user: (req as any).user });
});

// role-based route
router.get(
  "/admin",
  authMiddleware,
  authorizeRoles(Role.ADMIN),
  (req, res) => {
    res.json({ message: "Admin Access Granted" });
  }
);

export default router;
