import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetTier: { type: String, required: true },
    isActive: { type: Boolean, default: true },

    // Structuring the roadmap into strict weeks
    weeks: [
      {
        weekNumber: { type: Number, required: true },
        focusArea: { type: String, required: true },
        tasks: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

export const Roadmap = mongoose.model("Roadmap", roadmapSchema);
