import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { createSceneController, deleteSceneController, getSceneByLevelIdController, updateSceneController } from "../../controllers/admin/scene.controller";
import { requireAdminAuth } from "../../middlewares/requireAuth";

export const adminSceneRouter = Router();

// base url: http://localhost:3001/api/v1/admin/scene

// POST scene
adminSceneRouter.post("/", requireAdminAuth, asyncHandler(createSceneController));
adminSceneRouter.get("/level/:levelId", requireAdminAuth, asyncHandler(getSceneByLevelIdController));
// Update scene
adminSceneRouter.put("/:sceneId", requireAdminAuth, asyncHandler(updateSceneController));
// DELETE scene
adminSceneRouter.delete("/level/:levelId", requireAdminAuth, asyncHandler(deleteSceneController));  