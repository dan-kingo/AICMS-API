import { Router } from "express";
import { register } from "../controllers/authController";
import { validateData } from "../middlewares/validationMiddleware";
import registerSchema from "../schemas/registerSchema";

const authRouter = Router();

authRouter.post("/auth/register", validateData(registerSchema), register);

export default authRouter;
