import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import asyncHandler from "../../utils/asyncHandler";
import { getAllLevelsController, getLevelFullDetailsController, submitAnswerController } from "../../controllers/user/gameController";

export const userGameRouter = Router();

// base url: http://localhost:3001/api/v1/user/game
// GET all levels with user progress
userGameRouter.get("/levels", requireAuth, asyncHandler(getAllLevelsController));

// GET single level complete details (scenes, queries, hints, options)
userGameRouter.get("/levels/:levelNumber/full", requireAuth, asyncHandler(getLevelFullDetailsController));

// POST submit answer for a query
userGameRouter.post("/answer", requireAuth, asyncHandler(submitAnswerController));