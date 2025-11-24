import { Router } from "express";
import { requireAdminAuth } from "../../middlewares/requireAuth";
import asyncHandler from "../../utils/asyncHandler";
import { 
    createQuestionController,
    updateQuestionController,
    deleteQuestionController,
    getQuestionByIdController,
    getQuestionsBySceneIdController
} from "../../controllers/admin/question.controller";

export const adminQuestionRoutes = Router();
// base url: http://localhost:3001/api/v1/admin/question

// POST
adminQuestionRoutes.post("/", requireAdminAuth, asyncHandler(createQuestionController));

// GET
adminQuestionRoutes.get("/:questionId", requireAdminAuth, asyncHandler(getQuestionByIdController));
adminQuestionRoutes.get("/scene/:sceneId", requireAdminAuth, asyncHandler(getQuestionsBySceneIdController));

// PUT
adminQuestionRoutes.put("/:questionId", requireAdminAuth, asyncHandler(updateQuestionController));

// DELETE
adminQuestionRoutes.delete("/:questionId", requireAdminAuth, asyncHandler(deleteQuestionController));