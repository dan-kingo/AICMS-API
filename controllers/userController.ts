import { Response } from "express";
import _ from "lodash";
import { AuthRequest } from "../middlewares/authMiddleware";
import User from "../models/users";

const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ _id: req.user.userId });
    const safeUser = _.omit(user.toObject(), ["password"]);
    res.status(200).json({
      success: true,
      user: safeUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error occured!",
    });
  }
};

export { getCurrentUser };
