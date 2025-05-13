import { prisma } from "../../core/prismaClient";
import { CreateEventDTO } from "./event.validation";

export const createEvent = (data: CreateEventDTO) => {
  return prisma.event.create({ data });
};

export const deleteEvent = (eventId: string) => {
  return prisma.event.delete({ where: { id: eventId } });
};

export const getEventsByProjectId = (projectId: number) => {
  return prisma.event.findMany({
    where: { projectId },
    orderBy: { startDate: "asc" }
  });
};