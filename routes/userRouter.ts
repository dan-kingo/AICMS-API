import { Router } from "express";
import { getCurrentUser } from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";

const userRouter = Router();

userRouter.get("/user/current-user", authMiddleware, getCurrentUser);

export default userRouter;
