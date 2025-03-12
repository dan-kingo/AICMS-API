import { Router } from "express";
import { login, logout, register } from "../controllers/authController";
import { validateData } from "../middlewares/validationMiddleware";
import registerSchema from "../schemas/registerSchema";

const authRouter = Router();

authRouter.post("/auth/register", validateData(registerSchema), register);
authRouter.post("/auth/login", login);
authRouter.get("/auth/logout", logout);
export default authRouter;
