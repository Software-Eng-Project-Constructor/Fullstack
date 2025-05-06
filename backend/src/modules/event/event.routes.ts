// modules/events/events.route.ts
import { Router } from "express";
import * as Ctrl from "./evets.controller";

const router = Router();

router.get("/", Ctrl.getAllEvents);

export default router;

