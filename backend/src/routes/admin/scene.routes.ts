import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { createSceneController, getSceneByLevelIdController } from "../../controllers/admin/scene.controller";

export const adminSceneRouter = Router();

// base url: http://localhost:3001/api/v1/admin

// POST scene
adminSceneRouter.post("/scene", asyncHandler(createSceneController));
adminSceneRouter.get("/scene/level/:levelId", asyncHandler(getSceneByLevelIdController));
