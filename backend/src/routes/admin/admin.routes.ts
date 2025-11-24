import { Router } from "express";
import { adminLevelRouter } from "./level.routes";
import { adminSceneRouter } from "./scene.routes";
import { adminOptionRouter } from "./option.routes";
export const adminRouter = Router();

// base url: http://localhost:3001/api/v1/admin

adminRouter.use("/level", adminLevelRouter);
adminRouter.use("/scene", adminSceneRouter);
adminRouter.use("/option", adminOptionRouter);
