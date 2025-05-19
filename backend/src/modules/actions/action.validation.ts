// action.validation.ts
import { z } from "zod";

export const createActionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  stepId: z.string(),
  assignee: z.string().email(), // <-- expects email
});

export const updateActionStatusSchema = z.object({
  id: z.string(),
  completed: z.boolean(),
});

export type CreateActionDTO = z.infer<typeof createActionSchema>;
export type UpdateActionStatusDTO = z.infer<typeof updateActionStatusSchema>;
