import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import accessLogStream from "./middlewares/loggerMiddleware";
import corsOptions from "./middlewares/corsOptionsMiddleware";
import cors from "cors";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(cors(corsOptions));

app.get("/", (_req: Request, res: Response) => {
  res.send("Home page");
});
app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
