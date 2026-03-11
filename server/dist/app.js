"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const ticket_routes_1 = __importDefault(require("./routes/ticket.routes"));
const asset_routes_1 = __importDefault(require("./routes/asset.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const discussion_routes_1 = __importDefault(require("./routes/discussion.routes"));
const adminaction_route_1 = __importDefault(require("./routes/adminaction.route"));
const seedDemo_1 = require("./seed/seedDemo");
const app = (0, express_1.default)();
// ✅ CORS CONFIG (IMPORTANT)
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost", "http://135.235.195.238", "http://98.70.28.134"],
    credentials: true, // allow cookies
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// app.get("/" , console.log("Hello"))
app.use("/auth", auth_routes_1.default);
app.use("/admin", adminaction_route_1.default);
app.use("/tickets", ticket_routes_1.default);
app.use("/assets", asset_routes_1.default);
app.use("/notifications", notification_routes_1.default);
app.use("/discussion", discussion_routes_1.default);
// A convenient endpoint to run the demo seeder from the frontend (e.g. a "Seed" button).
// This calls the same `seedDemo` helper used by the CLI seed script.
app.get("/seed", async (req, res) => {
    try {
        const baseUrl = `http://localhost:${process.env.PORT ?? 8000}`;
        const result = await (0, seedDemo_1.seedDemo)(baseUrl);
        res.json(result);
    }
    catch (error) {
        console.error("Seed error:", error);
        res.status(500).json({ ok: false, error: error?.message || "Seeding failed" });
    }
});
exports.default = app;
