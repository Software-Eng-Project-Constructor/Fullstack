import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  priority: z.enum(["low", "medium", "high"]),
  category: z.enum(["work", "personal"]),
  projectId: z.number()
});

export type CreateEventDTO = z.infer<typeof createEventSchema>;
