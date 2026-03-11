import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import ticketRoutes from "./routes/ticket.routes"
import assetRoutes from "./routes/asset.routes";
import notificationRoutes from "./routes/notification.routes";
import discussionRoutes from "./routes/discussion.routes";


import adminRoutes from "./routes/adminaction.route";
import { seedDemo } from "./seed/seedDemo";


const app = express();

// ✅ CORS CONFIG (IMPORTANT)
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost", "http://135.235.195.238", "http://98.70.28.134"],
    credentials: true, // allow cookies
  })
);

app.use(express.json());
app.use(cookieParser());


// app.get("/" , console.log("Hello"))
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/tickets", ticketRoutes);
app.use("/assets", assetRoutes);
app.use("/notifications", notificationRoutes);
app.use("/discussion", discussionRoutes);

app.get("/seed", async (req, res) => {
    const baseUrl = `http://localhost:${process.env.PORT ?? 8000}`;
    const result = await seedDemo(baseUrl);
    res.json(result);
});

export default app;
