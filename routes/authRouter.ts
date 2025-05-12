import { Router } from "express";
import {
  adminLogin,
  forgotPassword,
  login,
  logout,
  register,
  resendOTP,
  resetPassword,
  suspendUser,
  unSuspendUser,
  verifyOTP,
} from "../controllers/authController.js";
import { validateData } from "../middlewares/validationMiddleware.js";
import registerSchema from "../schemas/registerSchema.js";

const authRouter = Router();

authRouter.post("/auth/register", validateData(registerSchema), register);
authRouter.post("/auth/login", login);
authRouter.post("/auth/admin-login", adminLogin);
authRouter.post("/auth/verify-otp", verifyOTP);
authRouter.post("/auth/resend-otp", resendOTP);
authRouter.post("/auth/forgot-password", forgotPassword);
authRouter.post("/auth/reset-password", resetPassword);
authRouter.get("/auth/logout", logout);
authRouter.get("/auth/suspend/:id", suspendUser);
authRouter.get("/auth/unsuspend/:id", unSuspendUser);
export default authRouter;
