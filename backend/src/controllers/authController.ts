import { Request, Response } from "express";
import { hashPassword, comparePassword, generateToken, verifyToken } from "../utils/authUtils";
import { prisma } from "../lib/prisma";
import crypto from "crypto"
import { sendOTPEmail } from "../utils/emailService";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user and send email verification OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered. Please verify your email.
 *       400:
 *         description: Bad request
 *       409:
 *         description: Email already in use
 */
export const registerUser = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) return res.status(400).json({ error: "All fields are required." });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already in use." });

  const passwordHash = await hashPassword(password);

  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  try {
    const user = await prisma.user.create({
      data: { email, password: passwordHash, username, otp, otpExpiry }
    });

    await sendOTPEmail(email, otp);

    return res.status(201).json({ message: "User registered. Please verify your email with the OTP sent." });
  } 
  catch (err) {
    return res.status(500).json({ error: "Registration failed." });
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and generate JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login with JWT token
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid credentials
 */
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


/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify user's email using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Bad request, invalid or expired OTP
 *       404:
 *         description: User not found
 */
export const verifyEmail = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp){
    return res.status(400).json({ error: "Email and OTP are required." });
  } 

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user){
      return res.status(404).json({ error: "User not found." });
    } 

    if (user.emailVerified){
      return res.status(400).json({ error: "Email already verified." });
    } 

    if (!user.otp || !user.otpExpiry){
      return res.status(400).json({ error: "OTP missing, request a new one." });
    } 

    if (user.otp !== otp){
      return res.status(400).json({ error: "Invalid OTP." });
    } 

    if (user.otpExpiry < new Date()){
      return res.status(400).json({ error: "OTP expired." });
    } 

    await prisma.user.update({
      where: { email },
      data: { emailVerified: true, otp: null, otpExpiry: null }
    });

    return res.status(200).json({ message: "Email verified successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Verification failed." });
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

export const logoutUser = async (req: Request, res: Response) => {
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
