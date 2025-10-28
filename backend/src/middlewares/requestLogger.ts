import { NextFunction, Request, Response } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method} request to ${req.originalUrl}`);
  next();
}