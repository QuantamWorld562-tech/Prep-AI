import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
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

    //ai gps specific fields
    targetLpa: {
      type: Number,
      required: true,
    },
    targetTier: {
      type: String,
      enum: ["Service", "Product", "Big-Tech"],
      required: true,
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

export const User = mongoose.model("User", userSchema);
