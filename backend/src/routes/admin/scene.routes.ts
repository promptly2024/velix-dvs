import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { createSceneController, deleteSceneController, getSceneByLevelIdController, updateSceneController } from "../../controllers/admin/scene.controller";

export const adminSceneRouter = Router();

// base url: http://localhost:3001/api/v1/admin/scene

// POST scene
adminSceneRouter.post("/", asyncHandler(createSceneController));
adminSceneRouter.get("/level/:levelId", asyncHandler(getSceneByLevelIdController));
// Update scene
adminSceneRouter.put("/:sceneId", asyncHandler(updateSceneController));
// DELETE scene
adminSceneRouter.delete("/level/:levelId", asyncHandler(deleteSceneController));  