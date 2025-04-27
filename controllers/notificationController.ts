import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import Notification from "../models/notification.js";

const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req?.user?.userId;
    const userRole = req?.user?.role;

    let query = {};

    if (userRole === "user") {
      query = { recipientId: userId };
    } else {
      query = { receiverRole: userRole };
    }

    const notifications = await Notification.find(query).sort({
      createdAt: -1,
    });
    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }
    res.status(200).json(notification);
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: "Failed to mark notifications" });
  }
};
export { getUserNotifications, markNotificationAsRead, markAllAsRead };
