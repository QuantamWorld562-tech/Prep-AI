import type { Request, Response, NextFunction } from "express";
import { Task } from "../models/taskModel.js";
import type { ITask } from "../models/taskModel.js";
import type { IRoadmap } from "../models/roadmapModel.js";
import { recalculateUserLPA } from "../services/lpaService.js";
import { getIo } from "../config/socket.js";
import type { TaskStatus } from "../types/index.js";

interface UpdateTaskBody {
  status: TaskStatus;
}

// Populated version of ITask — roadmapId is the full IRoadmap doc, not just an ObjectId
interface ITaskPopulated extends Omit<ITask, "roadmapId"> {
  roadmapId: IRoadmap;
}

export const updateTaskStatus = async (req: Request<{ id: string }, {}, UpdateTaskBody>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      res.status(400);
      throw new Error("Invalid status update");
    }
    const task = await Task.findById(req.params.id).populate("roadmapId") as ITaskPopulated | null;

    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    task.status = status;
    await task.save();

    // The Gamification Trigger
    if (status === "Completed") {
      const newLpa = await recalculateUserLPA(task.roadmapId.userId);

      // Emit event strictly to this user's private room
      getIo().to(task.roadmapId.userId.toString()).emit("lpaBump", {
        taskId: task._id.toString(),
        newLpa: newLpa,
        message: "Market Value Increased!",
      });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};
