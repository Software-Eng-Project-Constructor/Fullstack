import { prisma } from "../../core/prismaClient";
import { CreateProjectDTO, UpdateProjectDTO } from "./project.validation";
import {  createTeamMemberDTO } from "../team/team.validation"
import {  createTeamMember } from "../team/team.service"
export const createProject = async (dto: CreateProjectDTO, ownerId: string) => {
  const data: any = {
    name: dto.name,
    ownerId
  };

  if (dto.description) data.description = dto.description;
  if (dto.startDate) data.startDate = new Date(dto.startDate); // cast if string
  if (dto.dueDate) data.dueDate = new Date(dto.dueDate);


  const project = await prisma.project.create({ data });

  const teamMemberData: createTeamMemberDTO = {
    userId: ownerId,
    projectId: project.id,
    role: "Owner"   
  };
  
  await createTeamMember(teamMemberData);

  return project;
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





export const getProjectsByOwner = (ownerId: string) => {
  return prisma.project.findMany({
    where: { ownerId }
  });
};

export const getProjectsMemberOf = async (userId: string) => {
  return prisma.project.findMany({
    where: {
      teamMembers: {
        some: {
          userId: userId,
        },
      },
    },
  });
};
  
