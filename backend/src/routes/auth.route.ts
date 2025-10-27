import { Router } from "express";
import { loginUser, logoutUser, profile, registerUser, resetPassword, updateProfile, verifyEmail } from "../controllers/authController";
import asyncHandler from "../utils/asyncHandler";
import { requireAuth } from "../middlewares/requireAuth";

// Base URl : http://localhost:3001/api/auth
export const authRouter = Router();

// Auth Routes
authRouter.post('/register', asyncHandler(registerUser));
authRouter.post('/login', asyncHandler(loginUser));
authRouter.post('/verify-email', asyncHandler(verifyEmail));
authRouter.post('/logout', asyncHandler(logoutUser));

// Password Management
authRouter.post('/reset-password', asyncHandler(resetPassword));

// Profile Routes
authRouter.get('/profile', requireAuth, asyncHandler(profile));
authRouter.put('/update', requireAuth, asyncHandler(updateProfile))