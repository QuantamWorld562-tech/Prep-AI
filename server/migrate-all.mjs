#!/usr/bin/env node
/**
 * All-in-One Automated TypeScript Migration Script for Prep-AI Backend
 * Usage:
 *   cd server
 *   node migrate-all.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Starting Prep-AI TypeScript All-in-One Migration...\n");

// 1. Files definition map
const files = {
  // ─── TSCONFIG.JSON ────────────────────────────────────────────────────────
  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "sourceMap": true,
    "removeComments": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
`,

  // ─── SRC/TYPES/EXPRESS.D.TS ───────────────────────────────────────────────
  "src/types/express.d.ts": `import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      id?: string | Types.ObjectId;
      user?: {
        _id: Types.ObjectId | string;
        email?: string;
        userName?: string;
      };
    }
  }
}

export {};
`,

  // ─── SRC/TYPES/INDEX.TS ───────────────────────────────────────────────────
  "src/types/index.ts": `export type TargetTier = "Service" | "Product" | "Big-Tech";

export type TaskCategory = "DSA" | "Development" | "Contest";

export type TaskStatus = "Pending" | "In Progress" | "Completed";

export interface CookieOptionsType {
  httpOnly: boolean;
  sameSite: "none" | "lax" | "strict";
  secure: boolean;
  maxAge: number;
}

export interface LPABumpPayload {
  taskId: string;
  newLpa: number;
  message: string;
}

export interface ServerToClientEvents {
  lpaBump: (payload: LPABumpPayload) => void;
}

export interface ClientToServerEvents {
  joinRoom: (userId: string) => void;
}
`,

  // ─── SRC/MODELS/USER.TS ───────────────────────────────────────────────────
  "src/models/user.ts": `import mongoose, { Document, Schema, Types } from "mongoose";
import { TargetTier } from "../types/index.js";

export interface IUser extends Document {
  _id: Types.ObjectId;
  userName: string;
  username?: string;
  email: string;
  password?: string;
  photoUrl: string;
  targetLpa: number;
  targetTier: TargetTier;
  currentLpa: number;
  handles: {
    leetcode: string;
    codeforces: string;
  };
  resetOtp?: string;
  otpExpires?: Date;
  isoptverified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
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
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
      default: "",
    },
    targetLpa: {
      type: Number,
      default: 0,
    },
    targetTier: {
      type: String,
      enum: ["Service", "Product", "Big-Tech"],
      default: "Product",
    },
    currentLpa: {
      type: Number,
      default: 3.0,
    },
    handles: {
      leetcode: { type: String, default: "" },
      codeforces: { type: String, default: "" },
    },
    resetOtp: { type: String },
    otpExpires: { type: Date },
    isoptverified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
  },
  { timestamps: true }
);

userSchema.virtual("username").get(function (this: IUser) {
  return this.userName;
}).set(function (this: IUser, val: string) {
  this.userName = val;
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

export const User = mongoose.model<IUser>("User", userSchema);
`,

  // ─── SRC/MODELS/TASK.TS ───────────────────────────────────────────────────
  "src/models/task.ts": `import mongoose, { Document, Schema, Types } from "mongoose";
import { TaskCategory, TaskStatus } from "../types/index.js";

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
    lpaWeight: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Task = mongoose.model<ITask>("Task", taskSchema);
`,

  // ─── SRC/MODELS/ROADMAP.TS ────────────────────────────────────────────────
  "src/models/roadmap.ts": `import mongoose, { Document, Schema, Types } from "mongoose";

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
  { timestamps: true }
);

export const Roadmap = mongoose.model<IRoadmap>("Roadmap", roadmapSchema);
`,

  // ─── SRC/CONFIG/DB.TS ─────────────────────────────────────────────────────
  "src/config/db.ts": `import mongoose from "mongoose";

const connectDb = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDb;
`,

  // ─── SRC/CONFIG/SOCKET.TS ─────────────────────────────────────────────────
  "src/config/socket.ts": `import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../types/index.js";

let io: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

export const initSocket = (
  server: HttpServer
): Server<ClientToServerEvents, ServerToClientEvents> => {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(\`Client connected: \${socket.id}\`);

    socket.on("joinRoom", (userId: string) => {
      socket.join(userId);
    });
  });

  return io;
};

export const getIo = (): Server<ClientToServerEvents, ServerToClientEvents> => {
  if (!io) {
    throw new Error("Socket.io is not initialized. Call initSocket(server) first.");
  }
  return io;
};
`,

  // ─── SRC/CONFIG/SENDMAIL.TS ───────────────────────────────────────────────
  "src/config/sendMail.ts": `import nodemailer from "nodemailer";

const sendMail = async (to: string, otp: string): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: \`"Prep-AI Platform" <\${process.env.EMAIL_USER}>\`,
      to,
      subject: "Password Reset OTP",
      html: \`
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Prep-AI Password Reset</h2>
          <p>Your one-time verification code is:</p>
          <h1 style="color: #4F46E5; letter-spacing: 4px;">\${otp}</h1>
          <p>This code expires in 5 minutes. If you did not request this, please ignore this email.</p>
        </div>
      \`,
    });

    return true;
  } catch (error) {
    console.error("Nodemailer error:", error);
    return false;
  }
};

export default sendMail;
`,

  // ─── SRC/CONFIG/CLOUDINARY.TS ─────────────────────────────────────────────
  "src/config/cloudinary.ts": `import fs from "fs";

const uploadOnCloudinary = async (localFilePath?: string): Promise<string> => {
  try {
    if (!localFilePath) return "";

    const hasCloudinaryKeys =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (!hasCloudinaryKeys) {
      return localFilePath;
    }

    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "prep-ai-avatars",
    });

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return "";
  }
};

export default uploadOnCloudinary;
`,

  // ─── SRC/MIDDLEWARES/ERRORHANDLER.TS ──────────────────────────────────────
  "src/middlewares/errorHandler.ts": `import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;
`,

  // ─── SRC/MIDDLEWARES/ISAUTHENTICATED.TS ───────────────────────────────────
  "src/middlewares/isAuthenticated.ts": `import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface AuthTokenPayload extends JwtPayload {
  userId: string;
}

const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
      return;
    }

    const secret = process.env.SECRET_KEY;
    if (!secret) {
      throw new Error("SECRET_KEY environment variable is not defined");
    }

    const decoded = jwt.verify(token, secret) as AuthTokenPayload;

    if (!decoded || !decoded.userId) {
      res.status(401).json({
        message: "Invalid Token",
        success: false,
      });
      return;
    }

    req.id = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token",
      success: false,
    });
  }
};

export default isAuthenticated;
`,

  // ─── SRC/MIDDLEWARES/RATELIMIT.TS ─────────────────────────────────────────
  "src/middlewares/rateLimit.ts": `import { rateLimit } from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
});

export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many OTP requests. Please wait before retrying." },
});
`,

  // ─── SRC/MIDDLEWARES/MULTER.TS ────────────────────────────────────────────
  "src/middlewares/multer.ts": `import multer from "multer";
import os from "os";

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, os.tmpdir());
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, \`\${file.fieldname}-\${uniqueSuffix}-\${file.originalname}\`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
`,

  // ─── SRC/SERVICES/LLMSERVICE.TS ───────────────────────────────────────────
  "src/services/llmService.ts": `import { GoogleGenAI } from "@google/genai";
import { TaskCategory } from "../types/index.js";

let gemini: GoogleGenAI | null = null;

const getGemini = (): GoogleGenAI => {
  if (!gemini) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    gemini = new GoogleGenAI({ apiKey });
  }
  return gemini;
};

export interface AIResponseTask {
  title: string;
  category: TaskCategory;
  resourceLink?: string;
  lpaWeight?: number;
}

export interface AIResponseWeek {
  weekNumber: number;
  focusArea: string;
  tasks: AIResponseTask[];
}

export interface AIRoadmapResponse {
  weeks: AIResponseWeek[];
}

export const generateRoadmapJSON = async (
  targetTier: string,
  targetLpa: string | number
): Promise<AIRoadmapResponse> => {
  const prompt = \`
    You are an expert Senior Software Engineer. Create a strict 4-week study roadmap for a developer aiming for a \${targetLpa} LPA job at a \${targetTier} tier company.
    
    RULES:
    1. Select resources ONLY from these verified sources: Striver A2Z (DSA), Neetcode 150 (DSA), FreeCodeCamp (Dev), LeetCode Contests.
    2. Adjust the DSA vs Development ratio based on the Tier (Big Tech needs heavy DSA, Service needs more Dev).
    3. Output EXACTLY in this JSON format, nothing else:
    {
      "weeks": [
        {
          "weekNumber": 1,
          "focusArea": "String",
          "tasks": [
            { "title": "String", "category": "DSA", "resourceLink": "URL", "lpaWeight": 0.5 }
          ]
        }
      ]
    }
  \`;

  const client = getGemini();
  const response = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response received from Gemini AI service");
  }

  return JSON.parse(text) as AIRoadmapResponse;
};
`,

  // ─── SRC/SERVICES/LPASERVICE.TS ───────────────────────────────────────────
  "src/services/lpaService.ts": `import { Types } from "mongoose";
import { Task } from "../models/task.js";
import { Roadmap } from "../models/roadmap.js";
import { User } from "../models/user.js";

export const recalculateLPA = async (
  userId: string | Types.ObjectId
): Promise<number> => {
  try {
    const roadmap = await Roadmap.findOne({ userId, isActive: true });
    if (!roadmap) return 0;

    const completedTasks = await Task.find({
      roadmapId: roadmap._id,
      status: "Completed",
    });

    const baseLPA = 3.0;
    const earnedLPA = completedTasks.reduce(
      (sum, task) => sum + (task.lpaWeight || 0),
      0
    );
    const newCurrentLPA = Number((baseLPA + earnedLPA).toFixed(2));

    await User.findByIdAndUpdate(userId, { currentLpa: newCurrentLPA });

    return newCurrentLPA;
  } catch (error) {
    console.error("Error recalculating LPA:", error);
    throw error;
  }
};

export const recalculateUserLPA = recalculateLPA;
`,

  // ─── SRC/CONTROLLERS/USERCONTROLLER.TS ────────────────────────────────────
  "src/controllers/userController.ts": `import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User, IUser } from "../models/user.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import sendMail from "../config/sendMail.js";
import { CookieOptionsType } from "../types/index.js";

const generateOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

const hashValue = (value: string): string =>
  crypto.createHash("sha256").update(value).digest("hex");

export const cookieOptions: CookieOptionsType = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const serializeUser = (user: IUser) => {
  const userObject = user.toObject ? user.toObject() : { ...user };
  delete userObject.password;
  delete userObject.resetOtp;
  delete userObject.resetPasswordToken;
  return userObject;
};

export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      res.status(400).json({ success: false, message: "Missing fields" });
      return;
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      res.status(400).json({ success: false, message: "Email already in use" });
      return;
    }

    let photoUrl = "";
    if (req.file) {
      photoUrl = await uploadOnCloudinary(req.file.path);
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName,
      email,
      password: hashPassword,
      photoUrl,
    });

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY as string, {
      expiresIn: "7d",
    });

    res
      .cookie("token", token, cookieOptions)
      .status(201)
      .json({
        success: true,
        message: "Account created successfully",
        user: serializeUser(user),
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Missing fields" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const matchPassword = bcrypt.compareSync(password, user.password);
    if (!matchPassword) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY as string, {
      expiresIn: "7d",
    });

    res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({
        success: true,
        message: \`Welcome back \${user.userName}\`,
        user: serializeUser(user),
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token", cookieOptions);
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userName, email, photoUrl } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        userName,
        email,
        password: crypto.randomBytes(16).toString("hex"),
        photoUrl: photoUrl || "",
      });
    } else if (!user.photoUrl && photoUrl) {
      user.photoUrl = photoUrl;
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY as string, {
      expiresIn: "7d",
    });

    res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({
        success: true,
        message: "Google sign-in successful",
        user: serializeUser(user),
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "No account with that email" });
      return;
    }

    const otp = generateOtp();
    user.resetOtp = hashValue(otp);
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.isoptverified = false;
    await user.save();

    const emailSent = await sendMail(email, otp);
    if (!emailSent) {
      res.status(500).json({ success: false, message: "Failed to dispatch reset email" });
      return;
    }

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ success: false, message: "Email and OTP are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "No account with that email" });
      return;
    }

    if (!user.otpExpires || user.otpExpires.getTime() < Date.now()) {
      res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
      return;
    }

    if (user.resetOtp !== hashValue(otp)) {
      res.status(400).json({ success: false, message: "Invalid OTP" });
      return;
    }

    user.isoptverified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      res.status(400).json({ success: false, message: "Email and new password are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (!user.isoptverified) {
      res.status(400).json({ success: false, message: "Please verify your OTP first" });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.isoptverified = false;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
`,

  // ─── SRC/CONTROLLERS/ROADMAPCONTROLLER.TS ─────────────────────────────────
  "src/controllers/roadmapController.ts": `import { Request, Response, NextFunction } from "express";
import { Roadmap } from "../models/roadmap.js";
import { Task } from "../models/task.js";
import { User } from "../models/user.js";
import { generateRoadmapJSON } from "../services/llmService.js";

export const getMyRoadmap = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.id || req.user?._id;

    if (!userId) {
      res.status(401);
      throw new Error("User not authenticated. Please log in.");
    }

    const roadmap = await Roadmap.findOne({
      userId,
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

export const generateRoadmap = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.id || req.user?._id;
    const { targetTier, targetLpa } = req.body as {
      targetTier?: string;
      targetLpa?: string | number;
    };

    if (!userId) {
      res.status(401);
      throw new Error("User not authenticated. Please log in.");
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    const resolvedTier = user.targetTier || targetTier;
    const resolvedLpa = user.targetLpa || (targetLpa ? Number(targetLpa) : undefined);

    if (!resolvedTier || !resolvedLpa) {
      res.status(400);
      throw new Error(
        "Please provide targetTier and targetLpa in the request body."
      );
    }

    if (targetTier || targetLpa) {
      await User.findByIdAndUpdate(userId, {
        targetTier: resolvedTier,
        targetLpa: resolvedLpa,
      });
    }

    const aiData = await generateRoadmapJSON(resolvedTier, resolvedLpa);

    if (!aiData?.weeks || !Array.isArray(aiData.weeks)) {
      res.status(502);
      throw new Error("Invalid roadmap structure received from AI service.");
    }

    await Roadmap.updateMany({ userId: user._id, isActive: true }, { isActive: false });

    const roadmap = await Roadmap.create({
      userId: user._id,
      targetTier: resolvedTier,
      isActive: true,
      weeks: [],
    });

    for (const week of aiData.weeks) {
      const tasksToSave = (week.tasks || []).map((taskData) => ({
        roadmapId: roadmap._id,
        title: taskData.title,
        category: ["DSA", "Development", "Contest"].includes(taskData.category)
          ? taskData.category
          : "DSA",
        resourceLink: taskData.resourceLink || "",
        lpaWeight: typeof taskData.lpaWeight === "number" ? taskData.lpaWeight : 0.5,
        status: "Pending" as const,
      }));

      const savedTasks = await Task.insertMany(tasksToSave);

      roadmap.weeks.push({
        weekNumber: week.weekNumber,
        focusArea: week.focusArea,
        tasks: savedTasks.map((t) => t._id),
      });
    }

    await roadmap.save();

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
`,

  // ─── SRC/CONTROLLERS/TASKCONTROLLER.TS ────────────────────────────────────
  "src/controllers/taskController.ts": `import { Request, Response, NextFunction } from "express";
import { Task } from "../models/task.js";
import { recalculateLPA } from "../services/lpaService.js";
import { getIo } from "../config/socket.js";
import { TaskStatus } from "../types/index.js";

interface UpdateTaskBody {
  status: TaskStatus;
}

export const updateTaskStatus = async (
  req: Request<{ id: string }, {}, UpdateTaskBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      res.status(400);
      throw new Error("Invalid status update");
    }

    const task = await Task.findById(req.params.id).populate<{
      roadmapId: { userId: string };
    }>("roadmapId");

    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    task.status = status;
    await task.save();

    if (status === "Completed" && task.roadmapId?.userId) {
      const newLpa = await recalculateLPA(task.roadmapId.userId);

      getIo().to(task.roadmapId.userId.toString()).emit("lpaBump", {
        taskId: task._id.toString(),
        newLpa,
        message: "Market Value Increased!",
      });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};
`,

  // ─── SRC/ROUTES/USERROUTES.TS ─────────────────────────────────────────────
  "src/routes/userRoutes.ts": `import { Router } from "express";
import upload from "../middlewares/multer.js";
import {
  googleAuth,
  login,
  logout,
  signUp,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../controllers/userController.js";
import { authLimiter, otpLimiter } from "../middlewares/rateLimit.js";

const authRouter: Router = Router();

authRouter.post("/signup", authLimiter, upload.single("photoUrl"), signUp);
authRouter.post("/login", authLimiter, login);
authRouter.get("/logout", logout);
authRouter.post("/googleauth", googleAuth);

authRouter.post("/forgot-password", otpLimiter, forgotPassword);
authRouter.post("/verify-otp", otpLimiter, verifyOtp);
authRouter.post("/reset-password", otpLimiter, resetPassword);

export default authRouter;
`,

  // ─── SRC/ROUTES/ROADMAPROUTES.TS ──────────────────────────────────────────
  "src/routes/roadmapRoutes.ts": `import { Router } from "express";
import { generateRoadmap, getMyRoadmap } from "../controllers/roadmapController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const roadmapRouter: Router = Router();

roadmapRouter.get("/my-roadmap", isAuthenticated, getMyRoadmap);
roadmapRouter.post("/generate", isAuthenticated, generateRoadmap);

export default roadmapRouter;
`,

  // ─── SRC/ROUTES/TASKROUTES.TS ─────────────────────────────────────────────
  "src/routes/taskRoutes.ts": `import { Router } from "express";
import { updateTaskStatus } from "../controllers/taskController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const taskRouter: Router = Router();

taskRouter.put("/:id/status", isAuthenticated, updateTaskStatus);

export default taskRouter;
`,

  // ─── SRC/INDEX.TS ─────────────────────────────────────────────────────────
  "src/index.ts": `import "dotenv/config";
import http from "http";
import express, { Application, Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import connectDb from "./config/db.js";
import errorHandler from "./middlewares/errorHandler.js";
import authRouter from "./routes/userRoutes.js";
import roadmapRouter from "./routes/roadmapRoutes.js";
import taskRouter from "./routes/taskRoutes.js";
import { initSocket } from "./config/socket.js";

const app: Application = express();
const server = http.createServer(app);

// 1. Reverse Proxy Trust (Required for accurate rate limiting on Render / AWS / Heroku)
app.set("trust proxy", 1);

// 2. Global Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// 3. Graceful JSON Parsing Error Guard (Prevents 500 crash on malformed JSON payload)
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && "status" in err && err.status === 400 && "body" in err) {
    res.status(400).json({ success: false, message: "Invalid JSON format in request body" });
    return;
  }
  next(err);
});

// 4. Initialize Socket.io attached to the HTTP server
initSocket(server);

// 5. Health Check Endpoint (For Docker / Render / AWS Load Balancers)
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// 6. API Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/roadmap", roadmapRouter);
app.use("/api/v1/task", taskRouter);

// 7. Global Error Handling (Must be registered AFTER all routes)
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 1230;

server.listen(PORT, async () => {
  await connectDb();
  console.log(\`Server is running in \${process.env.NODE_ENV || "development"} mode on port \${PORT}\`);
});

// 8. Graceful Process Termination (Closes DB connection & server cleanly)
const gracefulShutdown = async (signal: string) => {
  console.log(\`\\nReceived \${signal}. Shutting down gracefully...\`);
  server.close(async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed. Process exited cleanly.");
    process.exit(0);
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
`,
};

// 2. Write all files
let count = 0;
for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, relPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, "utf8");
  count++;
  console.log("  ✓ Created " + relPath);
}

// 3. Update package.json scripts
const pkgPath = path.join(__dirname, "package.json");
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  pkg.scripts = {
    ...pkg.scripts,
    dev: "tsx watch src/index.ts",
    build: "tsc",
    start: "node dist/index.js",
    "type-check": "tsc --noEmit",
  };
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  console.log("  ✓ Updated package.json with dev, build, start, type-check scripts");
}

console.log("\n🎉 Successfully scaffolded all " + count + " TypeScript files!");
console.log("\nNext Steps:");
console.log("  1. Run 'npm run dev' to start development mode with hot-reload.");
console.log("  2. Run 'npm run build' to compile to dist/.");
console.log("  3. Run 'npm start' to start production server.\n");

