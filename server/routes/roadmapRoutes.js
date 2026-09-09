import express from "express";
import { getMyRoadmap } from "../controllers/roadmapController.js";

const roadmapRouter = express.Router();

roadmapRouter.get("/my-roadmap", getMyRoadmap);

export default roadmapRouter;
