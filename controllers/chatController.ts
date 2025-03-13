import axios from "axios";
import { Request, Response } from "express";
import * as dotenv from "dotenv";
dotenv.config();

const chatController = async (req: Request, res: Response) => {
  const { message } = req.body;
  try {
    // Make request to OpenAI API
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      },

      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

export default chatController;
