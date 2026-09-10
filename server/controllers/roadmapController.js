import { Roadmap } from "../models/roadmap.js";
import { Task } from "../models/task.js";
import { User } from "../models/user.js";
import { generateRoadmapJSON } from "../services/llmService.js";

// ─── Generate Roadmap (AI) ───────────────────────────────────────────────────
export const generateRoadmap = async (req, res, next) => {
  try {
    const userId = req.id || req.user?._id;

    if (!userId) {
      res.status(401);
      throw new Error("User not authenticated. Please log in.");
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    if (!user.targetTier || !user.targetLpa) {
      res.status(400);
      throw new Error(
        "Please complete your profile with targetTier and targetLpa first.",
      );
    }

    // 1. Fetch JSON from our LLM Service
    const aiData = await generateRoadmapJSON(user.targetTier, user.targetLpa);

    if (!aiData?.weeks || !Array.isArray(aiData.weeks)) {
      res.status(502);
      throw new Error("Invalid roadmap structure received from AI service.");
    }

    // 2. Deactivate any existing active roadmaps for this user
    await Roadmap.updateMany({ userId: user._id, isActive: true }, { isActive: false });

    // 3. Create new Roadmap document
    const roadmap = await Roadmap.create({
      userId: user._id,
      targetTier: user.targetTier,
      isActive: true,
      weeks: [],
    });

    // 4. Process each week: save tasks in batch and link ObjectIds
    for (const week of aiData.weeks) {
      const tasksToSave = (week.tasks || []).map((taskData) => ({
        roadmapId: roadmap._id,
        title: taskData.title,
        category: ["DSA", "Development", "Contest"].includes(taskData.category)
          ? taskData.category
          : "DSA",
        resourceLink: taskData.resourceLink || "",
        lpaWeight: typeof taskData.lpaWeight === "number" ? taskData.lpaWeight : 0.5,
        status: "Pending",
      }));

      const savedTasks = await Task.insertMany(tasksToSave);

      roadmap.weeks.push({
        weekNumber: week.weekNumber,
        focusArea: week.focusArea,
        tasks: savedTasks.map((task) => task._id),
      });
    }

    await roadmap.save();

    // 5. Populate tasks before returning
    const populatedRoadmap = await Roadmap.findById(roadmap._id).populate({
      path: "weeks.tasks",
      model: "Task",
    });

    res.status(201).json({
      success: true,
      message: "Roadmap generated successfully",
      data: populatedRoadmap,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Active Roadmap ───────────────────────────────────────────────────────
export const getMyRoadmap = async (req, res, next) => {
  try {
    const userId = req.id || req.user?._id;

    if (!userId) {
      res.status(401);
      throw new Error("User not authenticated. Please log in.");
    }

    const roadmap = await Roadmap.findOne({
      userId: userId,
      isActive: true,
    }).populate({ path: "weeks.tasks", model: "Task" });

    if (!roadmap) {
      res.status(404);
      throw new Error("No Active roadmap found. Please generate one first.");
    }

    res.status(200).json({ success: true, data: roadmap });
  } catch (error) {
    next(error);
  }
};
