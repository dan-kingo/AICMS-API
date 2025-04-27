import { Response, Request } from "express";
import axios from "axios";

import { AuthRequest } from "../middlewares/authMiddleware.js";
import Complaint, { IComplaint } from "../models/complaint.js";
import User from "../models/users.js";
import Notification from "../models/notification.js";

const createComplaint = async (req: AuthRequest, res: Response) => {
  const { description } = req.body;
  const userId = req.user?.userId;
  const fileUrl = req.file?.path || null;

  if (!description) {
    res.status(400).json({ error: "Complaint text is required" });
    return;
  }

  try {
    const aiResponse = await axios.post(
      "https://complaint-ai.onrender.com/predict",
      { description }
    );

    const predictedCategory = aiResponse.data.category;

    let assignedTo = "Customer Service Supervisor"; // default
    if (predictedCategory === "Supply") assignedTo = "Distribution Supervisor";
    else if (predictedCategory === "Employee") assignedTo = "General Manager";

    const newComplaint = await Complaint.create({
      user: userId,
      description,
      category: predictedCategory,
      assignedTo,
      supportingFile: fileUrl,
    });

    // send notification
    const handler = await User.findOne({ role: assignedTo });

    if (handler) {
      await Notification.create({
        recipientId: handler._id,
        message: `New complaint assigned regarding ${predictedCategory}: "${description}"`,
        receiverRole: assignedTo,
      });
    }

    res.status(201).json(newComplaint);
  } catch (err) {
    console.error("Error creating complaint:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserComplaints = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

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
  const role = req.user?.role;

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

const resolveComplaint = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["In Progress", "Resolved"].includes(status)) {
    res.status(400).json({ message: "Invalid status value" });
    return;
  }

  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedComplaint) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    // Send notification to the user
    await Notification.create({
      recipientId: updatedComplaint.user,
      message: `Your complaint which is ${updatedComplaint.description} is ${status}`,
    });

    res.status(200).json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: "Error resolving complaint", error });
  }
};

const escalateComplaint = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    let newAssignee = "";
    switch (complaint.assignedTo) {
      case "Customer Service Supervisor":
        newAssignee = "Distribution Supervisor";
        break;
      case "Distribution Supervisor":
        newAssignee = "General Manager";
        break;
      case "General Manager":
        res.status(400).json({ message: "Already at top level" });
        break;
      default:
        res.status(400).json({ message: "Unknown current assignee" });
        return;
    }

    complaint.assignedTo = newAssignee;
    await complaint.save();

    res.status(200).json({ message: "Complaint escalated", complaint });
  } catch (error) {
    res.status(500).json({ message: "Error escalating complaint", error });
  }
};
export {
  getUserComplaints,
  createComplaint,
  getAllComplaints,
  resolveComplaint,
  escalateComplaint,
};
