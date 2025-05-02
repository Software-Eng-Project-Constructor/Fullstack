import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { sessionMiddleware } from "./core/middleware/session";
import authRoutes from "./modules/auth/auth.routes";
import projectRoutes from "./modules/projects/project.routes";
import { authGuard } from "./core/middleware/authGuard";

const app = express();


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
  }));

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(sessionMiddleware);

// ─── Routes ──────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/projects", authGuard, projectRoutes); // ✅ ONLY HERE

app.get("/", (_req, res) => res.send("Backend is running"));



export default app;
