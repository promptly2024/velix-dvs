import { Router } from "express";
import {
  checkEmail,
  checkPassword,
  checkBatchEmails,
  getBreachHistory,
  generateReport,
  getStatistics,
} from "../controllers/breachController";
import asyncHandler from "../utils/asyncHandler";
import { requireAuth } from "../middlewares/requireAuth";

// base url: http://localhost:3001/api/v1/breach
export const breachRouter = Router();

// All routes require authentication
breachRouter.use(requireAuth);

// Email & Password Checks
breachRouter.post("/check-email", asyncHandler(checkEmail));
breachRouter.post("/check-password", asyncHandler(checkPassword));
breachRouter.post("/check-batch", asyncHandler(checkBatchEmails));

// History & Reports
breachRouter.get("/history", asyncHandler(getBreachHistory));
breachRouter.get("/report/:checkId", asyncHandler(generateReport));

// Statistics
breachRouter.get("/stats", asyncHandler(getStatistics));
