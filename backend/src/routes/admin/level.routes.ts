import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { createLevelController, getAllLevelsController, getLevelByNumberController, updateLevelController } from "../../controllers/admin/level.controller";

export const adminLevelRouter = Router();

// base url: http://localhost:3001/api/v1/admin/level

// POST level
adminLevelRouter.post("/", asyncHandler(createLevelController));

// PUT level
adminLevelRouter.put("/:levelNumber", asyncHandler(updateLevelController));
    
// GET levels
adminLevelRouter.get("/", asyncHandler(getAllLevelsController));
adminLevelRouter.get("/:levelNumber", asyncHandler(getLevelByNumberController));