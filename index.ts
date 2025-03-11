import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import debug from "debug";

import accessLogStream from "./middlewares/loggerMiddleware";
import corsOptions from "./middlewares/corsOptionsMiddleware";

const app: Express = express();
const PORT = process.env.PORT || 3000;
const appDebug = debug("app:startup");

app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("combined", { stream: accessLogStream }));
}
app.use(cors(corsOptions));

app.get("/", (_req: Request, res: Response) => {
  res.send("Home page");
});
app.listen(PORT, () => {
  appDebug(`server started at port ${PORT}`);
});
