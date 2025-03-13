import { Router } from "express";
import chatController from "../controllers/chatController";

const chatRouter = Router();

chatRouter.post("/chatbot", chatController);

export default chatRouter;
