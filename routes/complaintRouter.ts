import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  createComplaint,
  escalateComplaint,
  getAllComplaints,
  getUserComplaints,
  resolveComplaint,
} from "../controllers/complaintController";

const complaintRouter = Router();

complaintRouter.post("/complaints", authMiddleware, createComplaint);
complaintRouter.put(
  "/complaints/:id/resolve",
  authMiddleware,
  resolveComplaint
);
complaintRouter.put(
  "/complaints/:id/escalate",
  authMiddleware,
  escalateComplaint
);
complaintRouter.get("/complaints", authMiddleware, getUserComplaints);
complaintRouter.get("/all-complaints", authMiddleware, getAllComplaints);

export default complaintRouter;
