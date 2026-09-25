import mongoose, { Document, Schema, Types } from "mongoose";
import type { TargetTier } from "../types/index.js";

export interface IUser extends Document {
  _id: Types.ObjectId;
  userName: string;
  username?: string; // Virtual alias for backward compatibility
  email: string;
  password?: string;
  targetLpa?: number;   // set when roadmap is generated
  targetTier?: TargetTier; // set when roadmap is generated
  currentLpa: number;
  handles: {
    leetcode: string;
    codeforces: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },

    // AI GPS specific fields
    targetLpa: {
      type: Number,
      required: false, // provided only at roadmap generation
    },
    targetTier: {
      type: String,
      enum: ["Service", "Product", "Big-Tech"],
      required: false, // provided only at roadmap generation
    },
    currentLpa: {
      type: Number,
      default: 0,
    },

    //Third-parties integration
    handles: {
      leetcode: { type: String, default: "" },
      codeforces: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

//Virtual for backend-compatibilty with code referencing `user.username`
userSchema
  .virtual("username")
  .get(function (this: IUser) {
    return this.userName;
  })
  .set(function (this: IUser, val: string) {
    this.userName = val;
  });

//Ensure virtuals are serialized in JSON and Object representations
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

export const User = mongoose.model<IUser>("User", userSchema);
