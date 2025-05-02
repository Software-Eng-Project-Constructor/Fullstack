import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../core/prismaClient";

export async function signup(req: Request, res: Response) {
  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    (req.session)!.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    return res.status(201).json({ user: req.session!.user });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function signin(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    req.session!.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    return res.json({ user: req.session!.user });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export function whoAmI(req: Request, res: Response) {
  if (req.session!.user) {
    res.json({ user: req.session!.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
}

export function logout(req: Request, res: Response) {
  req.session!.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
}
