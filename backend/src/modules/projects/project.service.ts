import { prisma } from "../../core/prismaClient";
import { CreateProjectDTO, UpdateProjectDTO } from "./project.validation";

export const createProject = (dto: CreateProjectDTO, ownerId: string) => {
  const data: any = {
    name: dto.name,
    ownerId
  };

  if (dto.description) data.description = dto.description;
  if (dto.startDate) data.startDate = new Date(dto.startDate); // cast if string
  if (dto.dueDate) data.dueDate = new Date(dto.dueDate);

  return prisma.project.create({ data });
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
  
