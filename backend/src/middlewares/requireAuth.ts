import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/authUtils";

// Extend Express Request to include user information set by this middleware
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        name?: string;
        email?: string;
        role?: "ADMIN" | "USER";
        iat?: number;
        exp?: number;
      };
    }
  }
}

const getTokenFromRequest = (req: Request): string | null => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  // Check cookies or query parameters
  const anyReq = req as any;
  if (anyReq?.cookies?.token) return anyReq.cookies.token as string;
  if (typeof req.query?.token === "string") return req.query.token as string;

  return null;
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: "Unauthorized access. No token provided." });

  try {
    const decoded = verifyJwt(token);
    req.user = {
      userId: decoded.userId || decoded.id || decoded.sub,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp,
    };
    return next();
  } catch (err: any) {
    console.error("requireAuth error:", err?.message || err);
    return res.status(401).json({ error: "Invalid or expired token provided." });
  }
};

export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: "Unauthorized access. No token provided." });

  try {
    const decoded = verifyJwt(token);
    const role = decoded.role as "ADMIN" | "USER" | undefined;

    if (role !== "ADMIN") {
      console.error(`requireAdminAuth error: User role is ${role}, admin access required.`);
      return res.status(403).json({ error: "Forbidden. Admin privileges required." });
    }

    req.user = {
      userId: decoded.userId || decoded.id || decoded.sub,
      name: decoded.name,
      email: decoded.email,
      role,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    return next();
  } catch (err: any) {
    console.error("requireAdminAuth error:", err?.message || err);
    return res.status(401).json({ error: "Invalid or expired token provided." });
  }
};