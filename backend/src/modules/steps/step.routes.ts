// routes/modules/steps/step.routes.ts
import { Router } from "express";
import * as Ctrl from "./step.controller";

const router = Router();

// Create a step
router.post("/", Ctrl.createStep);

// Get a single step by ID
router.get("/:stepId", Ctrl.getStep);

// Get all steps for a specific milestone
router.get("/milestone/:milestoneId", Ctrl.getStepsByMilestone);

// Update a step
router.put("/:milestoneId/:stepId", Ctrl.updateStep);

// Delete a step
router.delete("/:milestoneId/:stepId", Ctrl.deleteStep);

export default router;
