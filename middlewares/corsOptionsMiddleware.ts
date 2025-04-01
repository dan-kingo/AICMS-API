import { CorsOptions } from "cors";

const whitelist: string[] = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://www.google.com",
  "https://dan-kingo.netlify.app",
  "https://eeucms.netlify.app",
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
