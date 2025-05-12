import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { sessionMiddleware } from "./core/middleware/session";
import { authGuard } from "./core/middleware/authGuard";

import authRoutes from "./modules/auth/auth.routes";
import projectRoutes from "./modules/projects/project.routes";
import taskRoutes from "./modules/tasks/task.routes";
import teamRoutes from "./modules/team/team.routes";
import eventsRouter from "./modules/event/event.routes";
import userRoutes from "./modules/users/users.routes";
import milestoneRoutes from "./modules/milestones/milestone.routes";
import fileRoutes from "./modules/file/file.routes"; // ✅ new file module import

const app = express();

// ✅ CORS configuration
app.use(cors({
  origin: "http://localhost:5173", // Update if using a different frontend port
  credentials: true,
}));
app.options("*", cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// ✅ Cookies & session
app.use(cookieParser());
app.use(sessionMiddleware);

// ✅ Logging
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});

// ✅ JSON body parsing
app.use(express.json({ limit: '10mb' }));

// ✅ Route registration
app.use("/api/auth", authRoutes);                    // open
app.use("/api/projects", authGuard, projectRoutes);  // protected
app.use("/api/tasks", authGuard, taskRoutes);        // protected
app.use("/api/teams", authGuard, teamRoutes);        // protected
app.use("/api/milestones", authGuard, milestoneRoutes); // protected
app.use("/api/events", eventsRouter);                // unprotected
app.use("/api/users", authGuard, userRoutes);        // protected
app.use("/api/files", fileRoutes);

// ✅ Health check
app.get("/", (_req, res) => res.send("Backend is running"));

export default app;
