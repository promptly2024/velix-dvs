import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { createLevelController, deleteLevelController, getAllLevelsController, getLevelByNumberController, updateLevelController } from "../../controllers/admin/level.controller";
import { requireAdminAuth } from "../../middlewares/requireAuth";

export const adminLevelRouter = Router();

// base url: http://localhost:3001/api/v1/admin/levels

// POST level
adminLevelRouter.post("/",requireAdminAuth, asyncHandler(createLevelController));

// PUT level
adminLevelRouter.put("/:levelNumber", requireAdminAuth, asyncHandler(updateLevelController));
    
// GET levels
adminLevelRouter.get("/", requireAdminAuth, asyncHandler(getAllLevelsController));
adminLevelRouter.get("/:levelNumber", requireAdminAuth, asyncHandler(getLevelByNumberController));

// DELETE level by number
adminLevelRouter.delete("/:levelNumber", requireAdminAuth, asyncHandler(deleteLevelController));