// src/core/middleware/authGuard.ts
import { Request, Response, NextFunction } from "express";

export const authGuard = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.user) return next();
  res.status(401).json({ message: "Not authenticated" });
};
