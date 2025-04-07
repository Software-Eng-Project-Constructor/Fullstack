import express, { Request, Response } from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || "secret123",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // use true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 2 // 2 hours
  }
}));

// ----------- ROUTES -----------

app.get("/", (_req: Request, res: Response) => {
  res.send("Backend is running");
});

// SIGN UP
app.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    // Create session
    (req.session)!.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    return res.status(201).json({ user: (req.session)!.user });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// SIGN IN
app.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // Save session
    (req.session)!.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    return res.json({ user: (req.session)!.user });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// WHO AM I
app.get("/me", (req: Request, res: Response) => {
  if ((req.session)!.user) {
    res.json({ user: (req.session)!.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// LOGOUT
app.post("/logout", (req: Request, res: Response) => {
  (req.session)!.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

// ---------------------- PROJECTS ----------------------

app.get("/projects", async (_req, res) => {
    try {
        const projects = await prisma.project.findMany();
        res.json(projects);
    } catch (error) {
        console.error("Get projects error:", error);
        res.status(500).json({ message: "Failed to fetch projects" });
    }
});

app.post("/projects", async (req, res) => {
    const { name } = req.body;
    try {
        const project = await prisma.project.create({ data: { name } });
        res.status(201).json(project);
    } catch (error) {
        console.error("Create project error:", error);
        res.status(500).json({ message: "Failed to create project" });
    }
});

app.delete("/projects/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await prisma.project.delete({ where: { id } });
        res.json({ message: "Project deleted" });
    } catch (error) {
        console.error("Delete project error:", error);
        res.status(500).json({ message: "Failed to delete project" });
    }
});


// ---------------------- TASKS ----------------------

app.get("/tasks", async (req, res) => {
    const projectId = parseInt(req.query.projectId as string);
    try {
        const tasks = await prisma.task.findMany({ where: { projectId } });
        res.json(tasks);
    } catch (error) {
        console.error("Get tasks error:", error);
        res.status(500).json({ message: "Failed to fetch tasks" });
    }
});

app.post("/tasks", async (req, res) => {
    const { title, description, assignedTo, status, projectId } = req.body;
    try {
        const task = await prisma.task.create({
            data: { title, description, assignedTo, status, projectId },
        });
        res.status(201).json(task);
    } catch (error) {
        console.error("Create task error:", error);
        res.status(500).json({ message: "Failed to create task" });
    }
});

app.delete("/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await prisma.task.delete({ where: { id } });
        res.json({ message: "Task deleted" });
    } catch (error) {
        console.error("Delete task error:", error);
        res.status(500).json({ message: "Failed to delete task" });
    }
});


// ---------------------- EVENTS ----------------------

app.get("/events", async (_req, res) => {
    try {
        const events = await prisma.event.findMany();
        res.json(events);
    } catch (error) {
        console.error("Get events error:", error);
        res.status(500).json({ message: "Failed to fetch events" });
    }
});

app.post("/events", async (req, res) => {
    const { id, title, description, startDate, endDate, priority, category } = req.body;
    try {
        const event = await prisma.event.create({
            data: { id, title, description, startDate, endDate, priority, category },
        });
        res.status(201).json(event);
    } catch (error) {
        console.error("Create event error:", error);
        res.status(500).json({ message: "Failed to create event" });
    }
});

app.delete("/events/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.event.delete({ where: { id } });
        res.json({ message: "Event deleted" });
    } catch (error) {
        console.error("Delete event error:", error);
        res.status(500).json({ message: "Failed to delete event" });
    }
});



export default app;


