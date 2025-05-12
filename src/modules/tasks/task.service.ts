import { prisma } from "../../core/prismaClient";
import { CreateTaskDTO, UpdateTaskDTO } from "./task.validation";

// export const createTask = (dto: CreateTaskDTO) => {
//     return prisma.task.create({ data: dto });
//   };

export const createTask = (dto: CreateTaskDTO) => {
  const { assignedTo, ...rest } = dto;

  return prisma.task.create({
    data: {
      ...rest,
      taskAssignments: assignedTo 
      ? {
            create: assignedTo.map((userId: string) => ({
              user: { connect: { id: userId } },
            })),
          }
        : { create: [] }, // important check so assigned to is treated as array
    },
    include: {
      taskAssignments: true,
    },
  });
  
};
  
export const getTasksByProject = (projectId: number) => {
  return prisma.task.findMany({ where: { projectId } });
};

export const updateTask = (id: string, ownerId: string, dto: UpdateTaskDTO) => {
  return prisma.task.updateMany({
    where: { id, project: { ownerId } },
    data: dto
  });
};

  

export const deleteTask = (taskId: string) => {
  return prisma.task.delete({ where: { id: taskId } });
};

export const getAssignedUsers = async (taskId: string) => {
  const assignments = await prisma.taskAssignment.findMany({
    where: { taskId },
    include: {
      user: true, // includes full user details
    },
  });

  return assignments.map((a) => a.user); // return just the users
};