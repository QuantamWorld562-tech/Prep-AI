import express from "express"
import { updateTaskStatus } from "../controllers/taskController.js";

const taskRouter = express.Router();

taskRouter.put('/:id/status',updateTaskStatus);

export default taskRouter;