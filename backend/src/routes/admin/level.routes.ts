import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { createLevelController, getAllLevelsController, getLevelByNumberController, updateLevelController } from "../../controllers/admin/level.controller";

export const adminLevelRouter = Router();

// base url: http://localhost:3001/api/v1/admin

// POST level
adminLevelRouter.post("/level", asyncHandler(createLevelController));

// PUT level
adminLevelRouter.put("/level/:levelNumber", asyncHandler(updateLevelController));

// GET levels
adminLevelRouter.get("/levels", asyncHandler(getAllLevelsController));
adminLevelRouter.get("/level/:levelNumber", asyncHandler(getLevelByNumberController));