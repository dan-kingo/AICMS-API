import express, { Express } from "express";
import morgan from "morgan";
import cors from "cors";
import debug from "debug";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
dotenv.config();

import accessLogStream from "./middlewares/loggerMiddleware";
import corsOptions from "./middlewares/corsOptionsMiddleware";
import mongoose from "mongoose";
import authRouter from "./routes/authRouter";
import userRouter from "./routes/userRouter";
import chatRouter from "./routes/chatRouter";
import predictRouter from "./routes/predictRouter";
import complaintRouter from "./routes/complaintRouter";

const app: Express = express();
const PORT = process.env.PORT || 3000;
const appDebug = debug("app:startup");
const dbDebug = debug("app:db");

app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("combined", { stream: accessLogStream }));
}
app.use(cors(corsOptions));
app.use(cookieParser());

// connect to database
mongoose
  .connect("mongodb://localhost/AICMS")
  .then(() => dbDebug("connected to database!"))
  .catch((err) => dbDebug(err));

//routes
app.use("/api", authRouter);
app.use("/api", userRouter);
app.use("/api", chatRouter);
app.use("/api", predictRouter);
app.use("/api", complaintRouter);

app.listen(PORT, () => {
  appDebug(`server started at port ${PORT}`);
});
