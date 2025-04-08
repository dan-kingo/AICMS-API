import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  createComplaint,
  getUserComplaints,
} from "../controllers/complaintController";

const complaintRouter = Router();

complaintRouter.post("/complaints", authMiddleware, createComplaint);
complaintRouter.get("/complaints", authMiddleware, getUserComplaints);

export default complaintRouter;
