import { Router } from "express";
import * as Ctrl from "./project.controller";

const router = Router();

router.get("/", Ctrl.getProjects);
router.post("/", Ctrl.createProject);
router.patch("/:id", Ctrl.updateProject);
router.delete("/:id", Ctrl.deleteProject);

export default router;
