import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { createSceneController, deleteSceneController, getAllScenesByLevelIdController, getSceneByIdController, getSceneByLevelIdController, updateSceneController } from "../../controllers/admin/scene.controller";
import { requireAdminAuth } from "../../middlewares/requireAuth";
import { upload } from "../../middlewares/upload";

export const adminSceneRouter = Router();

// base url: http://localhost:3001/api/v1/admin/scene

// POST scene
adminSceneRouter.post("/", requireAdminAuth, upload.array('media', 10), asyncHandler(createSceneController));

// Get all scenes for a level
adminSceneRouter.get("/level/:levelId/all", requireAdminAuth, asyncHandler(getAllScenesByLevelIdController));

// Get scence by level ID
adminSceneRouter.get("/level/:levelId", requireAdminAuth, asyncHandler(getSceneByLevelIdController));

// Update scene
adminSceneRouter.put("/:sceneId", requireAdminAuth, upload.array('media', 10), asyncHandler(updateSceneController));

// DELETE scene
// adminSceneRouter.delete("/level/:levelId", requireAdminAuth, asyncHandler(deleteSceneController));  
adminSceneRouter.delete("/:sceneId", requireAdminAuth, asyncHandler(deleteSceneController));


// Get scene by ID
adminSceneRouter.get("/:sceneId", requireAdminAuth, asyncHandler(getSceneByIdController));