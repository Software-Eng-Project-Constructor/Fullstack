import express from "express";
import cookieParser from "cookie-parser";

import { sessionMiddleware } from "./core/middleware/session";
import authRoutes from "./modules/auth/auth.routes";
import projectRoutes from "./modules/projects/project.routes";
import { authGuard } from "./core/middleware/authGuard";
import taskRoutes from "./modules/tasks/task.routes";
import teamRoutes from "./modules/team/team.routes"
import cors from "cors";
import eventsRouter from "./modules/event/event.routes"
import userRoutes from "./modules/users/users.routes";
import milestoneRoutes from "./modules/milestones/milestone.routes";

const app = express();

// ✅ FIRST: CORS must be before any cookies or sessions
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.options("*", cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// ✅ THEN: cookie & session
app.use(cookieParser());
app.use(sessionMiddleware);

app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});

// ✅ Then: body parsing
app.use(express.json({ limit: '10mb' }))

// ✅ Then: routes
app.use("/api/auth", authRoutes);                    // open
app.use("/api/projects", authGuard, projectRoutes);  // protected
app.use("/api/tasks", authGuard, taskRoutes);        // protected
app.use("/api/teams", authGuard, teamRoutes);        // protected
app.use("/api/milestones", authGuard, milestoneRoutes); // protected
app.use("/api/events", authGuard, eventsRouter);
app.use("/api/users", authGuard, userRoutes); //Salamario code

// ✅ 6. Health check
app.get("/", (_req, res) => res.send("Backend is running"));

export default app;
