import { Router } from "express";

export const adminOptionRouter = Router();

// base url: http://localhost:3001/api/v1/admin/option
import asyncHandler from "../../utils/asyncHandler";
import { createOptionController, deleteOptionController, getOptionsByQueryIdController, updateOptionController } from "../../controllers/admin/option.controller";

// POST option
adminOptionRouter.post("/", asyncHandler(createOptionController));
// GET options by queryId
adminOptionRouter.get("/query/:queryId", asyncHandler(getOptionsByQueryIdController));
// PUT option
adminOptionRouter.put("/:optionId", asyncHandler(updateOptionController));
// DELETE option
adminOptionRouter.delete("/:optionId", asyncHandler(deleteOptionController));