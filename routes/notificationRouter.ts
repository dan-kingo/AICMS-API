import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import getUserNotifications from "../controllers/notificationController.js";

const notificationRouter = Router();

notificationRouter.get("/notifications", authMiddleware, getUserNotifications);

export default notificationRouter;
