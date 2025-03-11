import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import accessLogStream from "./middlewares/loggerMiddleware";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan("combined", { stream: accessLogStream }));

app.get("/", (_req: Request, res: Response) => {
  res.send("Home page");
});
app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
