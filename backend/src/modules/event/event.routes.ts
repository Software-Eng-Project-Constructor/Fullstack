import { Router } from "express";
import * as Ctrl from "./event.controller";

const router = Router();

router.post("/", Ctrl.addEvent);
router.delete("/:eventId", Ctrl.removeEvent);
router.get("/project/:projectId", Ctrl.getEventsForProject);

export default router;
