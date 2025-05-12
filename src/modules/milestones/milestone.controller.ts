import { Request, Response } from "express";
import * as Service from "./milestone.service";

export const getMilestones = async (req: Request, res: Response) => {
  const projectId = req.query.projectId as string;
  if (!projectId) return res.status(400).json({ message: "projectId is required" });

  try {
  const milestones = await Service.getMilestonesByProject(projectId);
    res.json(milestones)} catch (error) {
    console.error('Error fetching milestones:', error);
  res.status(500).json({ message: "Failed to fetch milestones" });
  }
};

export const createMilestone = async (req: Request, res: Response) => {
  try {
    const milestone = await Service.createMilestone(req.body);
    res.status(201).json(milestone);
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(500).json({ message: "Failed to create milestone" });
  }
};

export const updateMilestone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const milestone = await Service.updateMilestone(id, req.body);
    res.json(milestone);
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ message: "Failed to update milestone" });
  }
};

export const deleteMilestone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Service.deleteMilestone(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting milestone:', error);
    res.status(500).json({ message: "Failed to delete milestone" });
  }
};