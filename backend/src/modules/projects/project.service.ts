import { prisma } from "../../core/prismaClient";
import { CreateProjectDTO, UpdateProjectDTO } from "./project.validation";

export const createProject = (dto: CreateProjectDTO, ownerId: string) => {
  return prisma.project.create({
    data: { ...dto, ownerId }
  });
};

export const getProjectsByOwner = (ownerId: string) => {
  return prisma.project.findMany({
    where: { ownerId }
  });
};

export const updateProject = (projectId: number, ownerId: string, data: UpdateProjectDTO) => {
    return prisma.project.updateMany({
      where: { id: projectId, ownerId },
      data
    });
  };
  
  export const deleteProject = (projectId: number, ownerId: string) => {
    return prisma.project.deleteMany({
      where: { id: projectId, ownerId }
    });
  };
  
