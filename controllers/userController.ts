import { Response } from "express";
import _ from "lodash";
import { AuthRequest } from "../middlewares/authMiddleware";
import User from "../models/users";
import { comparePassword, hashPassword } from "../utils/hashPassword";

interface ChangePasswordRequestBody {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

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
      omitUndefined: true,
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

const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access!" });
      return;
    }

    const userId = req.user.userId;
    const isAdmin = req.user.role === "admin";
    const isOwner = userId === req.params.id;

    if (!isAdmin && !isOwner) {
      res
        .status(403)
        .json({ success: false, message: "Unauthorized access denied!" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found!" });
      return;
    }

    await User.findByIdAndDelete(userId);

    res
      .status(200)
      .json({ success: true, message: "User account deleted successfully!" });
    return;
  } catch (err) {
    console.error("Error in deleteUser:", err);
    res
      .status(500)
      .json({ success: false, message: "Internal server error occurred!" });
    return;
  }
};

const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword }: ChangePasswordRequestBody = req.body;

  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const match = await comparePassword(currentPassword, user.password);

    if (!match) {
      res.status(401).json({ message: "Incorrect current password." });
      return;
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export { getCurrentUser, updateUser, deleteUser, changePassword };
