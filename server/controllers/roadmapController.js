import { Roadmap } from "../models/roadmap.js";
import { Task } from "../models/task.js";

export const getMyRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({
      userId: req.user._id,
      isActive: true,
    }).populate({ path: 'weeks.tasks', model: 'Task' });

    if (!roadmap) {
      res.status(404);
      throw new Error("No Active roadmap found. Please generate one first.");
    }

    res.status(200).json({ success: true, data: roadmap });
  } catch (error) {
    next(error);
  }
};
