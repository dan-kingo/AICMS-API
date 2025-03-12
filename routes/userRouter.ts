import { Router } from "express";
import { getCurrentUser, updateUser } from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";
import { validateData } from "../middlewares/validationMiddleware";
import registerSchema from "../schemas/registerSchema";

const userRouter = Router();

userRouter.get("/user/current-user", authMiddleware, getCurrentUser);
userRouter.post(
  "/user/update-user",
  authMiddleware,
  validateData(registerSchema),
  updateUser
);

export default userRouter;
