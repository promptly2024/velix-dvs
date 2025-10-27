import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

export const hashPassword = async (password: string) => await bcrypt.hash(password, 10);
export const comparePassword = async (password: string, hash: string) => await bcrypt.compare(password, hash);
export const generateToken = (userId: string) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
export const verifyToken = (token: string) => jwt.verify(token, JWT_SECRET);