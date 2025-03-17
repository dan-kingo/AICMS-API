import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  register,
  resendOTP,
  verifyOTP,
} from "../controllers/authController";
import { validateData } from "../middlewares/validationMiddleware";
import registerSchema from "../schemas/registerSchema";

const authRouter = Router();

authRouter.post("/auth/register", validateData(registerSchema), register);
authRouter.post("/auth/login", login);
authRouter.post("/auth/verify-otp", verifyOTP);
authRouter.post("/auth/resend-otp", resendOTP);
authRouter.post("/auth/forgot-password", forgotPassword);
authRouter.get("/auth/logout", logout);
export default authRouter;
