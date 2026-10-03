import { Router } from "express";
import { updateTaskStatus } from "../controllers/taskController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const taskRouter: Router = Router();

taskRouter.put("/:id/status", isAuthenticated, updateTaskStatus);

export default taskRouter;
