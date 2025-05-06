// modules/events/events.controller.ts
import { Request, Response } from "express";

// Dummy data for now
const events = [
  { id: 1, title: "Project Kickoff", date: "2025-05-10" },
  { id: 2, title: "Milestone 1", date: "2025-05-20" }
];

export const getAllEvents = (req: Request, res: Response) => {
  res.json(events);
};
