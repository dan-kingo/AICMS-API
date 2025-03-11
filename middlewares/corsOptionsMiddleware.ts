import { CorsOptions } from "cors";

const whitelist: string[] = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://www.google.com",
  "https://dan-kingo.netlify.app",
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
};

export default corsOptions;
