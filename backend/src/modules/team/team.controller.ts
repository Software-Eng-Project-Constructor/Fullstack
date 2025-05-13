import { Request, Response } from "express";
import * as Service from "./team.service";
import { createTeamMemberSchema } from "./team.validation";


export const createTeamMember = async (req: Request, res: Response) => {
  const parsed = createTeamMemberSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

    const userId = req.session!.user.id;

  try {
    const result = await Service.createTeamMemberWrapper(userId, parsed.data);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(403).json({ message: err.message });
  }
};

export const getTeamMembers = async (req: Request, res: Response) => {
  const userId = req.session!.user.id;
  const projectId = parseInt(req.params.projectId);

  // First, check that user is a member of the project
  const membership = await Service.getTeamMember(userId, projectId);
  if (!membership) return res.status(403).json({ message: "Not allowed" });

  const members = await Service.getTeamMembers(projectId);
  res.json(members);
};

export const deleteTeamMember = async (req: Request, res: Response) => {
  const currentUserId = req.session!.user.id;
  const projectId = parseInt(req.params.projectId);
  const targetUserId = req.params.userId;

  try {
    const result = await Service.deleteTeamMember(currentUserId, projectId, targetUserId);

    res.json({ message: "Team member removed." });
  } catch (err: any) {
    console.error("Error deleting team member:", err);
    res.status(403).json({ message: err.message });
  }
};