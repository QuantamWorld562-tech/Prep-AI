import mongoose, { Document, Schema, Types } from "mongoose";
import type { TaskCategory, TaskStatus } from "../types/index.js";

export interface ITask extends Document {
  _id: Types.ObjectId;
  roadmapId: Types.ObjectId;
  title: string;
  category: TaskCategory;
  resourceLink: string;
  status: TaskStatus;
  lpaWeight: number;
  createdAt: Date;
  updatedAt: Date;
}
const taskSchema = new Schema<ITask>(
  {
    roadmapId: {
      type: Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
    },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["DSA", "Development", "Contest"],
      required: true,
    },
    resourceLink: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },

    //How much this specific task bumps their Lpa when completed
    lpaWeight: { type: Number, required: true },
  },
  { timestamps: true },
);

export const Task = mongoose.model<ITask>("Task", taskSchema);
