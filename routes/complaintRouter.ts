import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  createComplaint,
  getAllComplaints,
  getUserComplaints,
} from "../controllers/complaintController";

const complaintRouter = Router();

complaintRouter.post("/complaints", authMiddleware, createComplaint);
complaintRouter.get("/complaints", authMiddleware, getUserComplaints);
complaintRouter.get("/all-complaints", authMiddleware, getAllComplaints);

export default complaintRouter;
