import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import ticketRoutes from "./routes/ticket.routes"

const app = express();

// ✅ CORS CONFIG (IMPORTANT)
app.use(
  cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true, // allow cookies
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);

export default app;
