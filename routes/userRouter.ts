import { Router } from "express";
import {
  changePassword,
  deleteUser,
  getCurrentUser,
  updateUser,
} from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";
import { validateData } from "../middlewares/validationMiddleware";
import updateSchema from "../schemas/updateSchema";

const userRouter = Router();

userRouter.get("/user/current-user", authMiddleware, getCurrentUser);
userRouter.post(
  "/user/update-user",
  authMiddleware,
  validateData(updateSchema),
  updateUser
);
userRouter.delete("/user/delete-user/:id", authMiddleware, deleteUser);
userRouter.post("/user/change-password", authMiddleware, changePassword);
export default userRouter;
