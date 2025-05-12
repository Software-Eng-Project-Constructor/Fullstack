import { Router } from "express";
import { FileController } from "./file.controller";
import { authGuard } from "../../core/middleware/authGuard";
import multer from "multer";

const router = Router();
const controller = new FileController();
const upload = multer({ dest: "uploads/" });

router.post("/:projectId", upload.single("file"), controller.uploadFile);
router.delete("/:fileId", authGuard, controller.deleteFile);
router.get("/:projectId", authGuard, controller.getFilesByProject);

export default router;
