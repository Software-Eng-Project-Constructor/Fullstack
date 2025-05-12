import { Router } from "express";
import * as Ctrl from "./milestone.controller";

const router = Router();

router.get("/", Ctrl.getMilestones);
router.post("/", Ctrl.createMilestone);
router.patch("/:id", Ctrl.updateMilestone);

router.delete("/:id", Ctrl.deleteMilestone);

export default router;