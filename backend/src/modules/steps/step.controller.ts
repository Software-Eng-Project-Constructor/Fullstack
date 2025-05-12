// controllers/modules/steps/step.controller.ts
import { Request, Response } from "express";
import * as StepService from "./step.service";
export const createStep = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user.id;
    const isAuthorized = await StepService.isTeamMember(userId, req.params.milestoneId);
    if (!isAuthorized) throw new Error("Forbidden");
    const step = await StepService.createStep(req.body);
    res.status(201).json(step);
  } catch (error) {
    res.status(500).json({ error: "Failed to create step" });
    console.error("Error creating step:", error);
  }
};

export const getStep = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user.id;
    const isAuthorized = await StepService.isTeamMember(userId, req.params.milestoneId);
    console.log("is authorized", isAuthorized);
    if (!isAuthorized) throw new Error("Forbidden");
    const step = await StepService.getStep(req.params.stepId);
    if (!step) return res.status(404).json({ error: "Step not found" });
    res.json(step);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch step" });
    console.error("Error getting step:", error);

  }
};

export const getStepsByMilestone = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user.id;
    const isAuthorized = await StepService.isTeamMember(userId, req.params.milestoneId);
    console.log("is authorized", isAuthorized);
    if (!isAuthorized) throw new Error("Forbidden");
    const steps = await StepService.getStepsByMilestone(req.params.milestoneId);
    res.json(steps);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch steps" });
    console.error("Error getting steps  :", error);

  }
};

export const updateStep = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user.id;
    const isAuthorized = await StepService.isTeamMember(userId, req.params.milestoneId);
    if (!isAuthorized) throw new Error("Forbidden");
    const step = await StepService.updateStep(req.params.stepId, req.body);
    res.json(step);
  } catch (error) {
    res.status(500).json({ error: "Failed to update step" });
  }
};

export const deleteStep = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user.id;
    const isAuthorized = await StepService.isTeamMember(userId, req.params.milestoneId);
    if (!isAuthorized) throw new Error("Forbidden");
    await StepService.deleteStep(req.params.stepId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete step" });
  }
};


