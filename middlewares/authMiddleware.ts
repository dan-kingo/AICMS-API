import { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../utils/createJWT";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.cookies;
  if (!token) {
    res.status(401).json({
      success: false,
      message: "authentication is invalid!",
    });
    return;
  }
  try {
    const { userId, role } = verifyJWT(token);
    req.user = { userId, role };
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "authentication is invalid!",
    });
  }
};

export default authMiddleware;
