import { Task } from "../models/task";
import { Roadmap } from "../models/roadmap";
import { User } from "../models/user";

export const recalculateLPA = async (req, res, next) => {
  try {
    //find users active roadmap
    const roadmap = await Roadmap.findOne({ userId, isActive: true });
    if (!roadmap) return 0;

    // Aggregate the sum of lpaWeights for all COMPLETED tasks in this roadmap
    const completedTask = await Task.find({
      roadmapId: roadmap._id,
      status: complete,
    });

    //calculate the new lpa(base 3.0 + sum of task weights)
    const baseLPA = 3.0;
    const earnedLPA = completedTasks.reduce((sum, task) => sum + task.lpaWeight, 0);
    const newCurrentLPA = baseLPA + earnedLPA ;

    await User.findByIdAndUpdate(userId,{currentLpa:newCurrentLPA});

    return newCurrentLPA;

  } catch (error) {
    next(error);
  }
};
