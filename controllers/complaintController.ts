import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Complaint, { IComplaint } from "../models/complaint";
import axios from "axios";

const createComplaint = async (req: AuthRequest, res: Response) => {
  const { description } = req.body;
  const userId = req.user.userId;

  if (!description) {
    res.status(400).json({ error: "Complaint text is required" });
    return;
  }

  try {
    const aiResponse = await axios.post("http://127.0.0.1:8000/predict", {
      description,
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
      description,
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

const getAllComplaints = async (req: AuthRequest, res: Response) => {
  const { role } = req.user;

  try {
    let complaints: IComplaint[] = [];

    if (role === "General Manager") {
      complaints = await Complaint.find().sort({ createdAt: -1 });
    } else if (role === "Distribution Supervisor") {
      complaints = await Complaint.find({
        assignedTo: "Distribution Supervisor",
      }).sort({
        createdAt: -1,
      });
    } else if (role === "Customer Service Supervisor") {
      complaints = await Complaint.find({
        assignedTo: "Customer Service Supervisor",
      }).sort({
        createdAt: -1,
      });
    } else {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export { getUserComplaints, createComplaint, getAllComplaints };
