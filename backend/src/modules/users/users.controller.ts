import { Request, Response } from "express";
import * as UserService from "./users.service";
import bcrypt from "bcryptjs";

// GET /api/users/me/full
export const getUserProfile = async (req: Request, res: Response) => {
  const userId = req.session!.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const user = await UserService.getUserById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { password, ...safeUser } = user;
    return res.json(safeUser);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};

// POST /api/users/update-settings
export const updateSettings = async (req: Request, res: Response) => {
  const userId = req.session!.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { name, email, description, theme, audioNotification } = req.body;

  try {
    const updated = await UserService.updateSettings(userId, {
      name,
      email,
      description,
      theme,
      audioNotification
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update settings" });
  }
};

// POST /api/users/update-password
export const updatePassword = async (req: Request, res: Response) => {
  const userId = req.session!.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { oldPassword, newPassword } = req.body;

  try {
    const user = await UserService.getUserById(userId);
    if (!user || !user.password)
      return res.status(404).json({ message: "User not found" });

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch)
      return res.status(403).json({ message: "Old password is incorrect" });

    await UserService.updatePassword(userId, newPassword);
    return res.status(204).send(); // No content
  } catch (err) {
    return res.status(500).json({ message: "Password update failed" });
  }
};

// POST /api/users/update-picture
export const updateProfilePicture = async (req: Request, res: Response) => {
  const userId = req.session!.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { base64Image } = req.body;

  if (
    !base64Image ||
    !base64Image.startsWith("data:image/") ||
    base64Image.length > 4_000_000
  ) {
    return res.status(400).json({ message: "Invalid or too large image" });
  }

  console.log("Received base64Image in controller:", base64Image ? base64Image.substring(0, 50) + '...' : 'null'); // Log first 50 chars


  try {
    const updatedUser = await UserService.updateProfilePicture(userId, base64Image);
    return res.json(updatedUser);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update profile picture" });
  }
};