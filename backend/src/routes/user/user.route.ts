import { Router } from "express";
import { userGameRouter } from "./game.route";
import { userProgressRouter } from "./progress.route";

export const userRouter = Router();
// base url: http://localhost:3001/api/v1/user

userRouter.use("/game", userGameRouter);
userRouter.use("/progress", userProgressRouter);
