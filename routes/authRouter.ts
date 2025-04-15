import { Router } from "express";
import {
  adminLogin,
  forgotPassword,
  login,
  logout,
  register,
  resendOTP,
  resetPassword,
  verifyOTP,
} from "../controllers/authController";
import { validateData } from "../middlewares/validationMiddleware";
import registerSchema from "../schemas/registerSchema";

const authRouter = Router();

authRouter.post("/auth/register", validateData(registerSchema), register);
authRouter.post("/auth/login", login);
authRouter.post("/auth/admin-login", adminLogin);
authRouter.post("/auth/verify-otp", verifyOTP);
authRouter.post("/auth/resend-otp", resendOTP);
authRouter.post("/auth/forgot-password", forgotPassword);
authRouter.post("/auth/reset-password", resetPassword);
authRouter.get("/auth/logout", logout);
export default authRouter;
