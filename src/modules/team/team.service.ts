import { prisma } from "../../core/prismaClient";
import { createTeamMemberDTO } from "./team.validation";


export const getTeamMember = async (userId: string, projectId: number) => {
  return prisma.teamMember.findFirst({
    where: {
      userId,
      projectId
    }
  });
};
export const getTeamMembers = async (projectId: number) => {
  return prisma.teamMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true 
        }
      }
    }
  });
};

export const createTeamMember = async (dto: createTeamMemberDTO) => {
  const data: any ={
    userId: dto.userId,
    projectId: dto.projectId,
    role: dto.role,
  };
  return prisma.teamMember.create({data});
};

//wrapper to check permission on team member creation and get userid via email
export const createTeamMemberWrapper = async (
  currentUserId: string,
  dto: createTeamMemberDTO
) => {
  const membership = await prisma.teamMember.findFirst({
    where: {
      userId: currentUserId,
      projectId: dto.projectId,
    },
  });
  const user = await prisma.user.findUnique({
    where: { email: dto.email },
  });
  if (!membership || !["Owner", "Admin"].includes(membership.role)) {
    throw new Error("Forbidden: Only Owner or Admin can add team members.");
  }
  if(!user){
    throw new Error("User with that email does not exist.");
  }
  const existingMember = await prisma.teamMember.findFirst({
    where: {
      userId: user.id,
      projectId: dto.projectId,
    },
  });

  if (existingMember) {
    const updated = await prisma.teamMember.update({
      where: { id: existingMember.id },
      data: { role: dto.role },
    });
    return updated;
  }


  const data: any ={
    userId: user.id,
    projectId: dto.projectId,
    role: dto.role,
  }
  console.log(data)
  return createTeamMember(data); 
};


export const deleteTeamMember = async (
  currentUserId: string,
  projectId: number,
  targetUserEmail: string
) => {

  // Check permission of current user
  const currentMembership = await prisma.teamMember.findFirst({
    where: {
      userId: currentUserId,
      projectId
    }
  });

  if (!currentMembership || !["Owner", "Admin"].includes(currentMembership.role)) {
    throw new Error("Forbidden: Only Owner or Admin can remove team members.");
  }
  const user = await prisma.user.findUnique({
    where: { email: targetUserEmail},
  });
  if(!user){
    throw new Error("User with that email does not exist.");
  }
  const targetUserId = user.id;
  // Prevent removing the Owner
  const targetMembership = await prisma.teamMember.findFirst({
    where: {
      userId: targetUserId,
      projectId
    }
  });

  if (!targetMembership) {
    throw new Error("Target user is not a team member of this project.");
  }

  if (targetMembership.role === "Owner") {
    throw new Error("Cannot remove the Owner of the project.");
  }

  return prisma.teamMember.deleteMany({
    where: {
      userId: targetUserId,
      projectId
    }
  });
};