import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createComplaint,
  escalateComplaint,
  getAllComplaints,
  getUserComplaints,
  resolveComplaint,
} from "../controllers/complaintController.js";
import upload from "../middlewares/multerMiddleware.js";

const complaintRouter = Router();

complaintRouter.post(
  "/complaints",
  authMiddleware,
  upload.single("supportingFile"),
  createComplaint
);
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
