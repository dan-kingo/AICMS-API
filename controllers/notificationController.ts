import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import Notification from "../models/notification.js";

const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const notifications = await Notification.find({ recipientId: userId }).sort(
      { createdAt: -1 }
    );
    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default getUserNotifications;
