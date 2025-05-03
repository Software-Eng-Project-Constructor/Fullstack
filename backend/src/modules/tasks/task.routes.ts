import express from "express";
import * as taskController from "./task.controller";

const router = express.Router();

router.post("/", taskController.createTask); // ✅ this handles POST /api/tasks
router.get("/", taskController.getTasks);
router.patch("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

export default router;
