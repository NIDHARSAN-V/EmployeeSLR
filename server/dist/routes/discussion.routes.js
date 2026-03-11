"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const discussion_controller_1 = require("../controllers/discussion.controller");
const router = (0, express_1.Router)();
router.get("/:kind/:id", discussion_controller_1.getMessages);
router.post("/:kind/:id/message", discussion_controller_1.addMessage);
exports.default = router;
