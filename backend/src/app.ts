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
import stepRoutes from "./modules/steps/step.routes";
import userRoutes from "./modules/users/users.routes";
import milestoneRoutes from "./modules/milestones/milestone.routes";
import actionRoutes from "./modules/actions/action.routes";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.options("*", cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(cookieParser());
app.use(sessionMiddleware);

app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: '10mb' }))

app.use("/api/auth", authRoutes);                    // open
app.use("/api/projects", authGuard, projectRoutes);  // protected
app.use("/api/tasks", authGuard, taskRoutes);        // protected
app.use("/api/teams", authGuard, teamRoutes);        // protected
app.use("/api/milestones", authGuard, milestoneRoutes); // protected
app.use("/api/events", eventsRouter);
app.use("/api/users", authGuard, userRoutes); 
app.use("/api/steps", authGuard, stepRoutes); 
app.use("/api/actions", authGuard, actionRoutes);  // protected

app.get("/", (_req, res) => res.send("Backend is running"));

export default app;

