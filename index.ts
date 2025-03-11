import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import debug from "debug";
import * as dotenv from "dotenv";
dotenv.config();

import accessLogStream from "./middlewares/loggerMiddleware";
import corsOptions from "./middlewares/corsOptionsMiddleware";
import mongoose from "mongoose";

const app: Express = express();
const PORT = process.env.PORT || 3000;
const appDebug = debug("app:startup");
const dbDebug = debug("app:db");

app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("combined", { stream: accessLogStream }));
}
app.use(cors(corsOptions));

// connect to database

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => dbDebug("connected to database!"))
  .catch((err) => dbDebug(err));

app.get("/", (_req: Request, res: Response) => {
  res.send("Home page");
});
app.listen(PORT, () => {
  appDebug(`server started at port ${PORT}`);
});
