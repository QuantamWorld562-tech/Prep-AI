import { Task } from "../models/taskModel.js";
import { Roadmap } from "../models/roadmapModel.js";
import { User } from "../models/userModel.js";

export const recalculateUserLPA = async (userId) => {
  try {
    // Find user's active roadmap
    const roadmap = await Roadmap.findOne({ userId, isActive: true });
    if (!roadmap) return 0;

    // Aggregate the sum of lpaWeights for all COMPLETED tasks in this roadmap
    const completedTasks = await Task.find({
      roadmapId: roadmap._id,
      status: "Completed",
    });

    // Calculate the new LPA (base 3.0 + sum of task weights)
    const baseLPA = 3.0;
    const earnedLPA = completedTasks.reduce((sum, task) => sum + task.lpaWeight, 0);
    const newCurrentLPA = baseLPA + earnedLPA ;

    await User.findByIdAndUpdate(userId, { currentLpa: newCurrentLPA });

    return newCurrentLPA;

  } catch (error) {
    throw error;
  }
};
