import { Request, Response } from "express";
import axios from "axios";

export const predictComplaintCategory = async (req: Request, res: Response) => {
  const { complaint } = req.body;

  try {
    const response = await axios.post("http://127.0.0.1:8000/predict", {
      text: complaint,
    });

    res.json({ category: response.data.category });
  } catch (error: any) {
    console.error("Prediction failed:", error.message);
    res.status(500).json({ error: "Prediction failed" });
  }
};
