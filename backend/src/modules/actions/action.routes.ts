import { Router } from "express";
import * as Ctrl from "./action.controller";

const router = Router();

/**
 * GET /api/actions/step/:stepId
 * → Fetch all actions for a given step
 */
router.get("/step/:stepId", Ctrl.getActionsByStep);

/**
 * POST /api/actions
 * → Create a new action (expects body: { title, description, priority, stepId, assignee })
 */
router.post("/", Ctrl.createAction);

/**
 * PATCH /api/actions/:id
 * → Update action by ID (e.g. toggle completion, update fields)
 */
router.patch("/:id", Ctrl.updateAction);

/**
 * DELETE /api/actions/:id
 * → Delete an action by ID
 */
router.delete("/:id", Ctrl.deleteAction);

export default router;
