import { Roadmap } from "../models/roadmap.js";
import { Task } from "../models/task.js";

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      res.status(400);
      throw new Error("Invalid status update");
    }
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    task.status = status;
    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};
