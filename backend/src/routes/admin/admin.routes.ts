import { Router } from "express";
import { adminLevelRouter } from "./level.routes";
import { adminSceneRouter } from "./scene.routes";
import { adminOptionRouter } from "./option.routes";
import { adminQuestionRoutes } from "./question.routes";
export const adminRouter = Router();

// base url: http://localhost:3001/api/v1/admin

adminRouter.use("/levels", adminLevelRouter);
adminRouter.use("/scene", adminSceneRouter);
adminRouter.use("/question", adminQuestionRoutes);
adminRouter.use("/option", adminOptionRouter);
