import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}


declare module "express-session" {
    interface SessionData {
        views?: number;
    }
}
