import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import asyncHandler from "../../utils/asyncHandler";
import { getCurrentAttemptController, getUserLevelHistoryController, getUserOverallProgressController, getUserStatsController } from "../../controllers/user/progressController";

export const userProgressRouter = Router();

// base url: http://localhost:3001/api/v1/user/progress

// user's overall progress across all levels
userProgressRouter.get("/", requireAuth, asyncHandler(getUserOverallProgressController));

// user's attempt history for specific level
userProgressRouter.get("/level/:levelNumber/history", requireAuth, asyncHandler(getUserLevelHistoryController));

// user's game statistics
userProgressRouter.get("/stats", requireAuth, asyncHandler(getUserStatsController));

// current active attempt (if any)
userProgressRouter.get("/current", requireAuth, asyncHandler(getCurrentAttemptController));
