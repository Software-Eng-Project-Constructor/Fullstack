// action.service.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createAction = async (data: any) => {
  try {
  console.log("🛠 Received in createAction service:", data);

  const user = await prisma.user.findUnique({ where: { id: data.assignee } });

  if (!user) throw new Error("Assignee user not found");

  const step = await prisma.step.findUnique({
    where: { id: data.stepId },
    include: { milestone: true },
  });
  if (!step || !step.milestone) throw new Error("Step or milestone not found");

  const projectId = step.milestone.projectId;

  const isMember = await prisma.teamMember.findFirst({
    where: { userId: user.id, projectId },
  });
  if (!isMember) throw new Error("Assignee is not a project team member");

  return await prisma.action.create({
    data: {
      title: data.title,
      description: data.description || "",
      status: 0, // pending
      priority: mapPriorityToInt(data.priority),
      stepId: data.stepId,
      assignedToId: user.id,
    },
  });
} catch (error) {
  console.error("🔥 Error inside createAction service:", error);
    throw error;
}
};

export const getActionsByStep = async (stepId: string) => {
  return await prisma.action.findMany({
    where: { stepId },
    include: { assignedTo: true },
  });
};

export const updateActionStatus = async (id: string, completed: boolean) => {
  console.log("👉 Updating:", id, "to status", completed ? 2 : 0);
  return await prisma.action.update({
    where: { id },
    data: {
      status: completed ? 2 : 0,
    },
  });
};

export const updateAction = async (
  
  id: string,
  updates: {
    completed?: boolean;
    title?: string;
    description?: string;
    priority?: string;
    assignee?: string;
  }
) => {
  const data: any = {};

  if (Object.prototype.hasOwnProperty.call(updates, "completed")) {
    data.status = updates.completed ? 2 : 0;
  }
  

  if (updates.title !== undefined) data.title = updates.title;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.priority !== undefined) {
    data.priority = mapPriorityToInt(updates.priority);
  }

  if (updates.assignee) {
    const user = await prisma.user.findUnique({ where: { id: updates.assignee } });
    if (!user) throw new Error("Assignee not found");
    data.assignedToId = user.id;
  }

  return await prisma.action.update({
    where: { id },
    data,
  });
};


export const deleteAction = async (id: string) => {
  return await prisma.action.delete({ where: { id } });
};

const mapPriorityToInt = (priority: string): number => {
  switch (priority) {
    case "high": return 2;
    case "medium": return 1;
    case "low":
    default: return 0;
  }
};

export const isTeamMember = async (userId: string, stepId: string) => {
  const step = await prisma.step.findUnique({
    where: { id: stepId },
    select: { milestone: { select: { projectId: true } } },
  });
  if (!step || !step.milestone) return false;

  const member = await prisma.teamMember.findFirst({
    where: { userId, projectId: step.milestone.projectId },
  });

  return !!member;
};

// Additional helper to validate access via action ID instead of stepId
export const isTeamMemberByAction = async (userId: string, actionId: string) => {
  const action = await prisma.action.findUnique({
    where: { id: actionId },
    include: {
      step: {
        include: {
          milestone: true,
        },
      },
    },
  });

  if (!action || !action.step || !action.step.milestone) return false;

  const projectId = action.step.milestone.projectId;

  const member = await prisma.teamMember.findFirst({
    where: { userId, projectId },
  });

  return !!member;
};
