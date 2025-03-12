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
  .connect(process.env.MONGODB_URL)
  .then(() => dbDebug("connected to database!"))
  .catch((err) => dbDebug(err));

//routes
app.use("/api", authRouter);

app.listen(PORT, () => {
  appDebug(`server started at port ${PORT}`);
});
