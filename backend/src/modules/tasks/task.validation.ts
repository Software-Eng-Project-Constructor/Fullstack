import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  approved: z.boolean().optional(),
  priority: z.number().optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  milestoneId: z.string().optional(),
  projectId: z.union([z.number(), z.string().transform(Number)]),
  createdById: z.string(), 
  assignedTo: z.array(z.string()).optional() 
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;
