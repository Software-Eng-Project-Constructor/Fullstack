// services/modules/steps/step.service.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createStep = async (data: any) => {
  return await prisma.step.create({ data });
};

export const getStep = async (stepId: string) => {
  return await prisma.step.findUnique({ where: { id: stepId } });
};

export const getStepsByMilestone = async (milestoneId: string) => {
  return await prisma.step.findMany({ where: { milestoneId } });
};

export const updateStep = async (stepId: string, data: any) => {
  return await prisma.step.update({ where: { id: stepId }, data });
};

export const deleteStep = async (stepId: string) => {
  return await prisma.step.delete({ where: { id: stepId } });
};

export const isTeamMember = async (userId: string, milestoneId: string) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    select: { projectId: true },
  });

  if (!milestone) return false;

  const teamMember = await prisma.teamMember.findFirst({
    where: {
      userId: userId,
      projectId: milestone.projectId,
    },
  });

  return !!teamMember;
};
