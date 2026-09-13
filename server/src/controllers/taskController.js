import { Roadmap } from "../models/roadmapModel.js";
import { Task } from "../models/taskModel.js";
import { recalculateUserLPA } from "../services/lpaService.js";
import { getIo } from "../config/socket.js";

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      res.status(400);
      throw new Error("Invalid status update");
    }
    const task = await Task.findById(req.params.id).populate("roadmapId");

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
        taskId: task._id,
        newLpa: newLpa,
        message: "Market Value Increased!",
      });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};
