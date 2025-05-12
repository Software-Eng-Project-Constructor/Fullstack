import { prisma } from "../../core/prismaClient";

export const getMilestonesByProject = async (projectId: string) => {
  return prisma.milestone.findMany({
    where: {
      projectId: parseInt(projectId)
    },
    include: {
      Task: true
    }
  });
};

export const createMilestone = async (data: any) => {
  return prisma.milestone.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      status: data.status,
      project: {
        connect: {
          id: parseInt(data.projectId)
        }
      }
    },
    include: {
      Task: true
    }
  });
};

export const updateMilestone = async (id: string, data: any) => {
  // First delete existing tasks if we're updating tasks
  if (data.tasks) {
    await prisma.task.deleteMany({
      where: {
        milestoneId: id
      }
    });
  }

  return prisma.milestone.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
      ...(data.status && { status: data.status }),
      ...(data.tasks && {
        Task: {
          create: data.tasks.map((task: any) => ({
            title: task.title,
            description: task.description,
            assignedTo: task.assignedTo,
            completed: task.completed,
            status: task.status,
            projectId: task.projectId
          }))
        }
      })
    },
    include: {
      Task: true,
    }
  });
};

export const deleteMilestone = async (id: string) => {
  // First delete associated tasks
  await prisma.task.deleteMany({
    where: {
      milestoneId: id
    }
  });

  // Then delete the milestone
  return prisma.milestone.delete({
    where: {
      id: id
    }
  });
};