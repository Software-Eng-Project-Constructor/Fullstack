// Members page

import { Request, Response } from "express";
import * as Service from "./project.service";
import { createProjectSchema, updateProjectSchema } from "./project.validation";
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

//only gets projects owned by the user
export const getProjects = async (req: Request, res: Response) => {
  const userId = req.session!.user.id;
  const projects = await Service.getProjectsByOwner(userId);
  res.json(projects);
};
//gets all projects user is member of including owned
export const getProjectsAll = async (req: Request, res: Response) => {
  const userId = req.session!.user.id;
  const projects = await Service.getProjectsMemberOf(userId);
  res.json(projects);
};

export const createProject = async (req: Request, res: Response) => {
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const userId = req.session!.user.id;
  const project = await Service.createProject(parsed.data, userId);
  res.status(201).json(project);
};

export const updateProject = async (req: Request, res: Response) => {
  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const userId = req.session!.user.id;
  const id = parseInt(req.params.id);
  const result = await Service.updateProject(id, userId, parsed.data);
  
  if (result.count === 0) return res.status(403).json({ message: "Not allowed" });
  res.json({ message: "Project updated" });
};

export const deleteProject = async (req: Request, res: Response) => {
  const userId = req.session!.user.id;
  const id = parseInt(req.params.id);
  const result = await Service.deleteProject(id, userId);
  
  if (result.count === 0) return res.status(403).json({ message: "Not allowed" });
  res.json({ message: "Project deleted" });
};

export const getProjectMembers = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    const members = await prisma.teamMember.findMany({
      where: {
        projectId: parseInt(projectId)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            privilege: true,
            profilePicPath: true
          }
        }
      }
    });

    res.json(members);
  } catch (error) {
    console.error('Error fetching project members:', error);
    res.status(500).json({ error: 'Failed to fetch project members' });
  }
};

export default router;
    