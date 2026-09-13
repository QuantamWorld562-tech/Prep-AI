import mongoose, { Document, Schema, Types } from "mongoose";

export interface IRoadmapWeek {
  weekNumber: number;
  focusArea: string;
  tasks: Types.ObjectId[];
}

export interface IRoadmap extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  targetTier: string;
  isActive: boolean;
  weeks: IRoadmapWeek[];
  createdAt: Date;
  updatedAt: Date;
}
const roadmapSchema = new Schema<IRoadmap>(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
            type: Schema.Types.ObjectId,
            ref: "Task",
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

export const Roadmap = mongoose.model<IRoadmap>("Roadmap", roadmapSchema);
