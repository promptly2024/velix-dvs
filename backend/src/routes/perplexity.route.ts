import { Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import { requireAuth } from "../middlewares/requireAuth";
import { getPerplexityScanHistory, scanWebPresenceWithPerplexity } from "../controllers/perplexitySearchController";

// base url: http://localhost:3001/api/v1/perplexity-search
export const perplexitySearchRouter = Router();

// All routes require authentication
perplexitySearchRouter.use(requireAuth);

// Perplexity web presence scanning
perplexitySearchRouter.post("/scan", asyncHandler(scanWebPresenceWithPerplexity));
perplexitySearchRouter.get("/history", asyncHandler(getPerplexityScanHistory));
