import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import { allowed, greetings, SYSTEM_PROMPT } from "../utils/chat.js";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const isRelevant = (message: string): boolean => {
  const lower = message.toLowerCase();

  return (
    greetings.some((g) => lower.includes(g)) ||
    allowed.some((k) => lower.includes(k))
  );
};

const chatController = async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "Invalid message input" });
    return;
  }

  if (!isRelevant(message)) {
    res.json({
      reply:
        "I'm here to assist only with EEU Complaint Management System-related queries.",
    });
    return;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "tunedModels/faqdataextended-3zwmtoin5v5t", // ✅ Corrected
    });

    const response = await model.generateContent(
      `${SYSTEM_PROMPT}\n\nUser: ${message}`
    );
    const reply = response.response.text();

    res.json({ reply });
  } catch (error: any) {
    console.error(
      "Error calling Gemini:",
      error.response?.data || error.message || error
    );
    res.status(500).json({ error: "Something went wrong with Gemini API." });
  }
};

export default chatController;
