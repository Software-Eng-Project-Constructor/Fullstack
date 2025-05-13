import { z } from "zod";

export const createStepSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.number().optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  milestoneId: z.string().nullable(),
});

export const updateStepSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.number().optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
});


export type createStepDTO = z.infer<typeof createStepSchema>;
export type updateStepDTO = z.infer<typeof updateStepSchema>;
