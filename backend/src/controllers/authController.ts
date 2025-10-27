import { Request, Response } from "express";
import { hashPassword, comparePassword, generateToken, verifyToken } from "../utils/authUtils";
import { prisma } from "../lib/prisma";

export const registerUser = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) return res.status(400).json({ error: "All fields are required." });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already in use." });

  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: { email, password: passwordHash, username }
    });
    const token = generateToken(user.id);
    return res.status(201).json({ user: { id: user.id, email: user.email, username: user.username }, token });
  } catch (err) {
    return res.status(500).json({ error: "Registration failed." });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials." });

  const valid = await comparePassword(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials." });

  const token = generateToken(user.id);
  return res.status(200).json({ user: { id: user.id, email: user.email, username: user.username }, token });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;
  try {
    const decoded = verifyToken(token) as { userId: string };
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { emailVerified: true }
    });
    return res.status(200).json({ message: "Email verified successfully." });
  } catch (err) {
    return res.status(400).json({ error: "Invalid or expired token." });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ error: "Email and new password required." });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "User not found." });

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { email },
    data: { password: passwordHash }
  });

  return res.status(200).json({ message: "Password reset successfully." });
};

export const logoutUser = async (_req: Request, res: Response) => {
  res.status(200).json({ message: "Logged out successfully." });
};

export const profile = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized." });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: "Profile not found." });

  return res.status(200).json({ user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt } });
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized." });
  const { email, username } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { email, username }
    });
    return res.status(200).json({ user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    return res.status(500).json({ error: "Profile update failed." });
  }
};
