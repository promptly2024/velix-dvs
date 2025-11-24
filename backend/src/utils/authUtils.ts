import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

export const hashPassword = async (password: string) => await bcrypt.hash(password, 10);
export const comparePassword = async (password: string, hash: string) => await bcrypt.compare(password, hash);
export const generateToken = (userId: string, name: string, email: string, role: 'ADMIN' | 'USER') => {
    return jwt.sign({
        userId,
        name,
        email,
        role
    }, JWT_SECRET, { expiresIn: '7d' });
}

export const verifyJwt = (token: string) => {
    if (!JWT_SECRET) throw new Error("JWT secret is not configured");
    return jwt.verify(token, JWT_SECRET) as Record<string, any>;
};