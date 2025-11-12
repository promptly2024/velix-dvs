import { Router } from "express";
import {
  scanWebPresence,
  analyzeDigitalFootprint,
  getRiskAssessment,
  getWebPresenceHistory,
  getDetailedReport,
} from "../controllers/webPresenceController";
import asyncHandler from "../utils/asyncHandler";
import { requireAuth } from "../middlewares/requireAuth";

// base url: http://localhost:3001/api/v1/web-presence
export const webPresenceRouter = Router();

// All routes require authentication
webPresenceRouter.use(requireAuth);

// Scanning & Analysis
webPresenceRouter.post("/scan", asyncHandler(scanWebPresence));
webPresenceRouter.post("/analyze", asyncHandler(analyzeDigitalFootprint));

// Risk Assessment
webPresenceRouter.get("/risk-assessment", asyncHandler(getRiskAssessment));

// History & Reports
webPresenceRouter.get("/history", asyncHandler(getWebPresenceHistory));
webPresenceRouter.get("/report/:scanId", asyncHandler(getDetailedReport));
