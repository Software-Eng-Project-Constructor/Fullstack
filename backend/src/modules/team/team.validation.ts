import { z } from "zod";


export const createTeamMemberSchema = z.object({
  projectId: z.union([z.number(), z.string().transform(Number)]),
  email: z.string().email().optional(),
  userId: z.string().optional(),
  role: z.enum(["Owner", "Admin", "Member"]),
}).refine((data) => data.email || data.userId, {
  message: "Either email or userId must be provided.",
});

export type createTeamMemberDTO = z.infer<typeof createTeamMemberSchema>;
