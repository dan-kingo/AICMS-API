import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const SYSTEM_PROMPT = `
You are a helpful assistant for the EEU AI-Assisted Complaint Management System (AICMS).
Only answer questions related to complaint submission, tracking, escalation, resolution, file uploads, login, registration, user roles, and system features.
Greet users politely if they say "Hi", "Hello", "Good morning", etc.
If asked anything outside these topics, respond with:
"I'm here to assist only with EEU Complaint Management System-related queries."
`;

const isRelevant = (message: string): boolean => {
  const lower = message.toLowerCase();
  const allowed = [
    "complaint",
    "submit",
    "track",
    "status",
    "resolve",
    "escalate",
    "ai",
    "system",
    "eeu",
    "file",
    "upload",
    "login",
    "register",
    "password",
    "role",
    "user",
    "profile",
    "account",
  ];

  const greetings = [
    "hi",
    "hello",
    "good morning",
    "good afternoon",
    "good afternoon",
    "hey",
    "how are you",
  ];

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
      model: " tunedModels/faqdataextended-3zwmtoin5v5t",
    });

    const chat = model.startChat({
      history: [
        {
          role: "system",
          parts: [{ text: SYSTEM_PROMPT }],
        },
      ],
    });

    const response = await chat.sendMessage(message);
    const reply = response.response.text();

    res.json({ reply });
  } catch (error) {
    console.error("Error calling Gemini:", error);
    res.status(500).json({ error: "Something went wrong with Gemini API." });
  }
};

export default chatController;
