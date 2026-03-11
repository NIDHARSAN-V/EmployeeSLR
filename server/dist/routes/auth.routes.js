"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const user_types_1 = require("../types/user.types");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.registerUser);
router.post("/login", auth_controller_1.loginUser);
router.post("/logout", auth_controller_1.logoutUser);
// protected routes
router.get("/profile", auth_middleware_1.authMiddleware, (req, res) => {
    res.json({ user: req.user });
});
// get all users
router.get("/all", auth_controller_1.getAllUsers);
// role-based route
router.get("/admin", auth_middleware_1.authMiddleware, (0, role_middleware_1.authorizeRoles)(user_types_1.Role.ADMIN), (req, res) => {
    res.json({ message: "Admin Access Granted" });
});
// get user by id
router.get("/:id", auth_middleware_1.authMiddleware, auth_controller_1.getUserById);
exports.default = router;
