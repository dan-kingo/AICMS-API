import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getUserNotifications,
  markAllAsRead,
  markNotificationAsRead,
} from "../controllers/notificationController.js";

const notificationRouter = Router();

notificationRouter.get("/notifications", authMiddleware, getUserNotifications);
notificationRouter.put(
  "/notifications/:id/read",
  authMiddleware,
  markNotificationAsRead
);
notificationRouter.put(
  "/notifications/mark-all-read",
  authMiddleware,
  markAllAsRead
);

export default notificationRouter;
