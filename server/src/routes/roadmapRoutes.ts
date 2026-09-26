import { Router } from "express";
import {
  generateRoadmap,
  getMyRoadmap,
} from "../controllers/roadmapController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const roadmapRouter: Router = Router();

roadmapRouter.get("/my-roadmap", isAuthenticated, getMyRoadmap);
roadmapRouter.post("/generate", isAuthenticated, generateRoadmap);

export default roadmapRouter;
