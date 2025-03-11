import express, { Express, Request, Response } from "express";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.get("/", (_req: Request, res: Response) => {
  res.send("Home page");
});
app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
