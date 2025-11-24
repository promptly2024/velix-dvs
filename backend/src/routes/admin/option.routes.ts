import { Router } from "express";

export const adminOptionRouter = Router();

// base url: http://localhost:3001/api/v1/admin/option
import asyncHandler from "../../utils/asyncHandler";
import { createOptionController, deleteOptionController, getOptionsByQueryIdController, updateOptionController } from "../../controllers/admin/option.controller";
import { requireAdminAuth } from "../../middlewares/requireAuth";

// POST option
adminOptionRouter.post("/", requireAdminAuth, asyncHandler(createOptionController));
// GET options by queryId
adminOptionRouter.get("/query/:queryId", requireAdminAuth, asyncHandler(getOptionsByQueryIdController));
// PUT option
adminOptionRouter.put("/:optionId", requireAdminAuth, asyncHandler(updateOptionController));
// DELETE option
adminOptionRouter.delete("/:optionId", requireAdminAuth, asyncHandler(deleteOptionController));