import { Request, Response } from "express";
import * as Service from "./task.service";
import { createTaskSchema, updateTaskSchema } from "./task.validation";

export const getTasks = async (req: Request, res: Response) => {
  const projectId = Number(req.query.projectId);
  if (!projectId) return res.status(400).json({ message: "projectId is required" });

  const tasks = await Service.getTasksByProject(projectId);
  res.json(tasks);
};

export const createTask = async (req: Request, res: Response) => {
  console.log("🔥 createTask endpoint hit");
  console.log("RAW BODY:", req.body);
  
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    console.log("Zod error:", parsed.error.flatten());
    return res.status(400).json({ message: "Invalid task input", errors: parsed.error.flatten() });
  }

  const task = await Service.createTask(parsed.data);
  res.status(201).json(task);
};

  
export const updateTask = async (req: Request, res: Response) => {
    const taskId = req.params.id;
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid update input" });
  
    const task = await Service.updateTask(taskId, req.session!.user.id, parsed.data);
    res.json(task);
  };
  

export const deleteTask = async (req: Request, res: Response) => {
  const taskId = req.params.id;
  await Service.deleteTask(taskId);
  res.json({ message: "Task deleted" });
};

export const getAssignedUsers = async (req: Request, res: Response) => {
  const taskId = req.params.id;

  if (!taskId) {
    return res.status(400).json({ message: "Invalid task ID" });
  }
  try {
    const users = await Service.getAssignedUsers(taskId);
    res.json(users);
  } catch (error) {
    console.error("Error in getAssignedUsers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};