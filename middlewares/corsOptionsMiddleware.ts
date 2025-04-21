import { CorsOptions } from "cors";

const whitelist: string[] = [
  "http://localhost:3000",
  "https://aicms-api.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://www.google.com",
  "http://127.0.0.1:8000",
  "https://eeucms.netlify.app",
  "https://eeucms-admin.netlify.app",
  "https://complaint-ai.onrender.com",
  "https://eeucms.onrender.com",
  "https://eeucms-admin.onrender.com",
];

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true); // Allow request
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

export default corsOptions;
