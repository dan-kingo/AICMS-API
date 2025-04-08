import { Router } from "express";
import { predictComplaintCategory } from "../controllers/predictController.js";

const predictRouter = Router();

predictRouter.post("/predict", predictComplaintCategory);

export default predictRouter;
