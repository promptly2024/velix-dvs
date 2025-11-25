import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import asyncHandler from "../../utils/asyncHandler";
import { getAllLevelsController } from "../../controllers/admin/level.controller";
import { completeLevelController, getLevelDetailsController, getSceneController, retryLevelController, startLevelController, submitAnswerController, useLevelHintController } from "../../controllers/user/gameController";

export const userGameRouter = Router();

// base url: http://localhost:3001/api/v1/user/game

// all available levels
userGameRouter.get("/levels", requireAuth, asyncHandler(getAllLevelsController));

// specific level details (before starting)
userGameRouter.get("/levels/:levelNumber", requireAuth, asyncHandler(getLevelDetailsController));

// start a new level attempt
userGameRouter.post("/levels/:levelNumber/start", requireAuth, asyncHandler(startLevelController));

// current scene for ongoing attempt
userGameRouter.get("/attempt/:attemptId/scene", requireAuth, asyncHandler(getSceneController));

// submit answer for current query
userGameRouter.post("/attempt/:attemptId/answer", requireAuth, asyncHandler(submitAnswerController));

// request hint for current query
userGameRouter.post("/attempt/:attemptId/hint", requireAuth, asyncHandler(useLevelHintController));

// complete level (when all scenes/queries done)
userGameRouter.post("/attempt/:attemptId/complete", requireAuth, asyncHandler(completeLevelController));

// retry failed level
userGameRouter.post("/levels/:levelNumber/retry", requireAuth, asyncHandler(retryLevelController));