// modules/events/events.route.ts
import { Router } from "express";
import * as Ctrl from "./evets.controller";

const router = Router();

router.get("/", Ctrl.getAllEvents);
router.post("/", Ctrl.createEvent);
router.delete("/:id", Ctrl.deleteEvent);
router.delete("/", Ctrl.deleteEventByMilestone);

export default router;

