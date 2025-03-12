import { Router } from "express";
import { register } from "../controllers/authController";

const authRouter = Router();

authRouter.post("/auth/register", register);

export default authRouter;
