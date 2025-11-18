import express, { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { upload } from "../middlewares/upload";
import asyncHandler from "../utils/asyncHandler";
import { runParallelSecurityScan } from "../controllers/orchestrationController";

// Base URL: http://localhost:3001/api/v1/orchestration
export const orchestrationRouter = Router();

orchestrationRouter.post( "/comprehensive-scan", requireAuth, upload.single('document'), asyncHandler(runParallelSecurityScan) );
