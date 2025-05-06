import { Router } from "express";
import {
  getUserProfile,
  updateSettings,
  updatePassword,
  updateProfilePicture,
} from "./users.controller";
import { authGuard } from "../../core/middleware/authGuard";

const router = Router();

// GET /api/users/me/full — get full user profile
router.get("/me/full", authGuard, getUserProfile);

// POST /api/users/update-settings — update general settings
router.post("/update-settings", authGuard, updateSettings);

// POST /api/users/update-password — securely update password
router.post("/update-password", authGuard, updatePassword);

// POST /api/users/update-picture — update profile picture (base64 string)
router.post("/update-picture", authGuard, updateProfilePicture);

export default router;