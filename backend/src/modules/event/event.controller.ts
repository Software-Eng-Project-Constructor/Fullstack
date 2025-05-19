import { Request, Response } from "express";
import * as Service from "./event.service";
import { createEventSchema } from "./event.validation";

export const addEvent = async (req: Request, res: Response) => {
  
  const parsed = createEventSchema.safeParse(req.body);
  console.log("Parsed Event Data:", parsed.data);


  if (!parsed.success) return res.status(400).json(parsed.error);

  try {
    const event = await Service.createEvent(parsed.data);
    res.status(201).json({ success: true, eventId: event.id });
  } catch (error) {
    console.error("Failed to create event", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const removeEvent = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  try {
    await Service.deleteEvent(eventId);
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("Failed to delete event", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const getEventsForProject = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);


  if (isNaN(projectId)) return res.status(400).json({ error: "Invalid projectId" });

  try {
    const events = await Service.getEventsByProjectId(projectId);
    console.log("Returning Event Data:", events);

    res.json({ success: true, events });
  } catch (error) {
    console.error("Failed to fetch events", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
