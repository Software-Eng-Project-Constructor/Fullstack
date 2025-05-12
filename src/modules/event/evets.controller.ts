// modules/events/events.controller.ts
import { Request, Response } from "express";
import { prisma } from "../../core/prismaClient";

export const getAllEvents = async (req: Request, res: Response) => {
  const events = await prisma.event.findMany();
  res.json(events);
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { id, title, description, startDate, endDate, priority, category } = req.body;

    const event = await prisma.event.create({
      data: {
        id,
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        priority,
        category,
      }
    });

    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.event.delete({
      where: { id }
    });

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: "Failed to delete event" });
  }
};

export const deleteEventByMilestone = async (req: Request, res: Response) => {
  const { milestoneId } = req.query;
  
  if (!milestoneId) {
    return res.status(400).json({ message: "Milestone ID is required" });
  }

  await prisma.event.deleteMany({
    where: {
      milestoneId: milestoneId as string
    }
  });

  res.json({ message: "Events deleted successfully" });
};
