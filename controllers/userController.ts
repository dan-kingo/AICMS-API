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

const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access!" });
      return;
    }

    const updates = _.omit(req.body, ["_id", "password"]);

    const isAdmin = req.user.role === "admin";
    const isOwner = req.user.userId === req.params.id;

    if (!isAdmin && !isOwner) {
      res
        .status(403)
        .json({ success: false, message: "Unauthorized access denied!" });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      res.status(404).json({ success: false, message: "User not found!" });
      return;
    }

    const safeUser = _.omit(updatedUser.toObject(), ["password"]);

    res.status(200).json({ success: true, user: safeUser });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error occurred!" });
  }
};
export { getCurrentUser, updateUser };
