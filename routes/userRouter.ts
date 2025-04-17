import { Router } from "express";
import {
  changePassword,
  deleteUser,
  getAllUsers,
  getCurrentUser,
  updateUser,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validateData } from "../middlewares/validationMiddleware.js";
import updateSchema from "../schemas/updateSchema.js";

const userRouter = Router();

userRouter.get("/users", getAllUsers);
userRouter.get("/user/current-user", authMiddleware, getCurrentUser);
userRouter.put(
  "/user/update-user/:id",
  authMiddleware,
  validateData(updateSchema),
  updateUser
);
userRouter.delete("/user/delete-user/:id", authMiddleware, deleteUser);
userRouter.post("/user/change-password", authMiddleware, changePassword);
export default userRouter;
