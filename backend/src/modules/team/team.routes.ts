import { Router } from "express";
import * as Ctrl from "./team.controller";

const router = Router();

// Add a team member (requires email or userId)
router.post("/", Ctrl.createTeamMember);

// Get all team members for a given project
router.get("/:projectId", Ctrl.getTeamMembers);

// Delete a team member from a project
router.delete("/:projectId/:userId", Ctrl.deleteTeamMember);

export default router;
