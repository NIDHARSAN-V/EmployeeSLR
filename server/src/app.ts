import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import ticketRoutes from "./routes/ticket.routes"
import assetRoutes from "./routes/asset.routes";
import notificationRoutes from "./routes/notification.routes";


const app = express();

// ✅ CORS CONFIG (IMPORTANT)
app.use(
  cors({
    origin: "*", // frontend URL
    credentials: true, // allow cookies
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/tickets", ticketRoutes);
app.use("/assets", assetRoutes);
app.use("/notifications", notificationRoutes);


export default app;
