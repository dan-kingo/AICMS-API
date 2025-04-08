import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Complaint from "../models/complaint";
import axios from "axios";

const createComplaint = async (req: AuthRequest, res: Response) => {
  const { complaint } = req.body;
  const userId = req.user.userId;

  if (!complaint) {
    res.status(400).json({ error: "Complaint text is required" });
    return;
  }

  try {
    const aiResponse = await axios.post("http://127.0.0.1:8000/predict", {
      text: complaint,
    });

    const predictedCategory = aiResponse.data.category;

    let assignedTo: string;

    switch (predictedCategory) {
      case "Supply":
        assignedTo = "Distribution Supervisor";
        break;
      case "Employee":
        assignedTo = "General Manager";
        break;
      default:
        assignedTo = "Customer Service Supervisor";
        break;
    }

    const newComplaint = await Complaint.create({
      user: userId,
      complaint,
      category: predictedCategory,
      assignedTo,
    });

    res.status(201).json(newComplaint);
  } catch (err) {
    console.error("Error creating complaint:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getUserComplaints = async (req: AuthRequest, res: Response) => {
  const userId = req.user.userId;

  try {
    const complaints = await Complaint.find({ user: userId }).sort({
      createdAt: -1,
    });
    res.json(complaints);
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { getUserComplaints, createComplaint };
