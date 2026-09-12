# Complete TypeScript Migration Guide for Prep-AI Backend

A production-grade, step-by-step handbook for migrating the entire Prep-AI Express & Node.js backend from JavaScript (ESM) to modern TypeScript.

---

## Table of Contents
1. [Core Concepts: What, Why & How of TypeScript Migration](#1-core-concepts-what-why--how-of-typescript-migration)
2. [Target Architecture & Directory Structure](#2-target-architecture--directory-structure)
3. [Step 1: Install Dependencies & Type Definitions](#step-1-install-dependencies--type-definitions)
4. [Step 2: Configure `tsconfig.json`](#step-2-configure-tsconfigjson)
5. [Step 3: Update `package.json` Scripts & Entry](#step-3-update-packagejson-scripts--entry)
6. [Step 4: Global Type Definitions (`src/types/`)](#step-4-global-type-definitions-srctypes)
7. [Step 5: Migrate Mongoose Models (`src/models/`)](#step-5-migrate-mongoose-models-srcmodels)
8. [Step 6: Migrate Configuration Layer (`src/config/`)](#step-6-migrate-configuration-layer-srcconfig)
9. [Step 7: Migrate Middlewares (`src/middlewares/`)](#step-7-migrate-middlewares-srcmiddlewares)
10. [Step 8: Migrate Domain Services (`src/services/`)](#step-8-migrate-domain-services-srcservices)
11. [Step 9: Migrate Controllers (`src/controllers/`)](#step-9-migrate-controllers-srccontrollers)
12. [Step 10: Migrate Routes (`src/routes/`)](#step-10-migrate-routes-srcroutes)
13. [Step 11: Migrate Entry Point (`src/index.ts`)](#step-11-migrate-entry-point-srcindexts)
14. [Step 12: Build, Run & Verification Protocol](#step-12-build-run--verification-protocol)
15. [Crucial TypeScript Gotchas & Solutions](#crucial-typescript-gotchas--solutions)

---

## 1. Core Concepts: What, Why & How of TypeScript Migration

### What is TypeScript in a Backend Context?
TypeScript is a statically typed superset of JavaScript. It compiles (transpiles) down into plain JavaScript that Node.js executes. At runtime, TypeScript types are completely erased—meaning **zero runtime performance penalty**.

### Why Migrate? (The Pain Points It Solves)
1. **Elimination of `undefined` Runtime Crashes:**
   In JavaScript, accessing `task.roadmapId.userId` or `req.user._id` crashes the server if `roadmapId` or `user` is null. TypeScript forces you to handle optional properties (`task.roadmapId?.userId`) before code can even compile.
2. **Strict Enum & Contract Safety:**
   In JavaScript, a typo like `status: complete` instead of `status: 'Completed'` creates silent bugs or crashes database queries. In TypeScript, enums and union types (`TaskStatus = "Pending" | "In Progress" | "Completed"`) make invalid strings a compilation error.
3. **API & Request Safety:**
   Express’s `req.body`, `req.params`, and `req.query` are typed as `any` in plain JS. In TypeScript, controllers specify exact request shapes (e.g. `Request<{}, {}, SignupDTO>`), giving autocomplete and compile-time validation.
4. **Refactoring Confidence:**
   Renaming a database field (e.g. `username` to `userName`) in JavaScript requires manual searching across dozens of files. In TypeScript, the compiler instantly pinpoints every single file, query, and controller that needs updating.

### How Does the Migration Process Work?
1. **Set Up the Compiler:** Configure `tsconfig.json` to enforce strict mode, NodeNext module resolution, and output to `dist/`.
2. **Move Source to `src/`:** All `.js` files move into `src/` and are renamed to `.ts`.
3. **Declare Types First:** Define TypeScript interfaces for Models, Express Requests, and API payloads.
4. **Bottom-Up Migration Order:**
   - Layer 1: Types & Interfaces (`src/types/`)
   - Layer 2: Mongoose Database Models (`src/models/`)
   - Layer 3: Utilities & Config (`src/config/`)
   - Layer 4: Middlewares (`src/middlewares/`)
   - Layer 5: Services (`src/services/`)
   - Layer 6: Controllers (`src/controllers/`)
   - Layer 7: Routes (`src/routes/`)
   - Layer 8: Server Entry (`src/index.ts`)
5. **Verify with `tsc` and Run:** Test with `tsx` (development) and `tsc` build (production).

---

## 2. Target Architecture & Directory Structure

All active source files live under `server/src/`. The production compilation output is emitted to `server/dist/`.

```text
server/
├── .env
├── package.json
├── tsconfig.json
├── dist/                          # Transpiled production JavaScript (gitignored)
└── src/                           # Active TypeScript Codebase
    ├── index.ts                   # Entry point (HTTP server + Socket.IO + Express)
    ├── types/                     # Shared TypeScript interfaces & declaration merging
    │   ├── express.d.ts           # Express Request decoration (req.id, req.user)
    │   └── index.ts               # Shared union types, enums, DTOs, Socket types
    ├── config/
    │   ├── db.ts                  # Mongoose connection
    │   ├── socket.ts              # Typed Socket.IO server setup
    │   ├── sendMail.ts            # Nodemailer OTP emailer
    │   └── cloudinary.ts          # File upload integration
    ├── models/
    │   ├── user.ts                # Typed User model & IUser interface
    │   ├── task.ts                # Typed Task model & ITask interface
    │   └── roadmap.ts             # Typed Roadmap model & IRoadmap interface
    ├── middlewares/
    │   ├── errorHandler.ts        # Typed Express ErrorRequestHandler
    │   ├── isAuthenticated.ts     # JWT verification & Request decoration
    │   ├── rateLimit.ts           # Route-specific rate limiters
    │   └── multer.ts              # Multipart file upload middleware
    ├── services/
    │   ├── llmService.ts          # Google Gemini 2.0 Flash (with commented OpenAI fallback)
    │   └── lpaService.ts          # LPA market-value recalculation engine
    ├── controllers/
    │   ├── userController.ts      # Auth & password reset controllers
    │   ├── roadmapController.ts   # AI roadmap generation & retrieval controllers
    │   └── taskController.ts      # Task status update & gamified Socket trigger
    └── routes/
        ├── userRoutes.ts          # Auth routing
        ├── roadmapRoutes.ts       # Roadmap routing
        └── taskRoutes.ts          # Task routing
```

---

## Step 1: Install Dependencies & Type Definitions

Run the following command inside `server/` to install the TypeScript compiler, development runner, and official type packages (`@types/*`):

```bash
cd server
npm install @google/genai cloudinary
npm install -D typescript @types/node @types/express @types/cors @types/cookie-parser @types/jsonwebtoken @types/bcrypt @types/multer @types/nodemailer tsx
```

### What Each Package Does:
* `typescript`: The core compiler (`tsc`) that validates types and transpiles `.ts` to `.js`.
* `tsx`: Modern TypeScript execution engine with native ESM support and instant file watching (`tsx watch src/index.ts`). Replaces `nodemon`.
* `@google/genai`: Official Google GenAI SDK for Gemini 2.0 Flash models (native TypeScript support included).
* `cloudinary`: Cloudinary Node.js SDK for avatar image uploads.
* `@types/express`: Type declarations for `Request`, `Response`, `NextFunction`, `Router`.
* `@types/node`: Types for Node globals (`process.env`, `http`, `Buffer`, `crypto`).
* `@types/cors`, `@types/cookie-parser`, `@types/jsonwebtoken`, `@types/bcrypt`, `@types/multer`, `@types/nodemailer`: Provide intellisense and parameter type-checking for each respective library.

---

## Step 2: Configure `tsconfig.json`

Create `server/tsconfig.json`:

```json
{
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
```

### Concept & Flag Explanations:
- `"module": "NodeNext"` & `"moduleResolution": "NodeNext"`: Enforces official Node.js ECMAScript Module (ESM) resolution. **Requires `.js` extensions on relative imports in `.ts` files**.
- `"strict": true`: Turns on all strict type-checking flags, preventing type coercions and unexpected runtime crashes.
- `"strictNullChecks": true`: Prevents accessing properties on objects that could be `null` or `undefined` without a check.
- `"outDir": "./dist"`: The build directory where compiled `.js` files are saved for production deployment.

---

## Step 3: Update `package.json` Scripts & Entry

Update `server/package.json`:

```json
{
  "name": "server",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "type-check": "tsc --noEmit"
  }
}
```

- `npm run dev`: Starts the server with `tsx watch` for hot-reloading on every file save.
- `npm run build`: Compiles all TypeScript files in `src/` to production JavaScript in `dist/`.
- `npm start`: Runs the compiled JavaScript file `dist/index.js` in production (e.g. Render / AWS / Docker).
- `npm run type-check`: Runs the TypeScript compiler check without emitting files, ideal for CI/CD pipelines.

---

## Step 4: Global Type Definitions (`src/types/`)

### 1. `src/types/express.d.ts` (Express Declaration Merging)
**Concept:** By default, Express's `Request` interface does not have `.id` or `.user`. In plain JS developers attach properties arbitrarily (`req.id = decode.userId`), but TypeScript throws `Property 'id' does not exist on type 'Request'`. Declaration merging safely extends the Express interface globally.

```typescript
import { Types } from "mongoose";

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
```

### 2. `src/types/index.ts` (Shared Domain Types)
```typescript
export type TargetTier = "Service" | "Product" | "Big-Tech";

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

// Socket.IO Strong Event Typings
export interface ServerToClientEvents {
  lpaBump: (payload: LPABumpPayload) => void;
}

export interface ClientToServerEvents {
  joinRoom: (userId: string) => void;
}
```

---

## Step 5: Migrate Mongoose Models (`src/models/`)

### 1. `src/models/user.ts`
```typescript
import mongoose, { Document, Schema, Types } from "mongoose";
import { TargetTier } from "../types/index.js";

export interface IUser extends Document {
  _id: Types.ObjectId;
  userName: string;
  username?: string; // virtual alias
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

// Virtual for backward-compatibility with username
userSchema.virtual("username").get(function (this: IUser) {
  return this.userName;
}).set(function (this: IUser, val: string) {
  this.userName = val;
});

export const User = mongoose.model<IUser>("User", userSchema);
```

### 2. `src/models/task.ts`
```typescript
import mongoose, { Document, Schema, Types } from "mongoose";
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
```

### 3. `src/models/roadmap.ts`
```typescript
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
```

---

## Step 6: Migrate Configuration Layer (`src/config/`)

### 1. `src/config/db.ts`
```typescript
import mongoose from "mongoose";

const connectDb = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    await mongoose.connect(mongoUri);
    console.log("MongoDb connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDb;
```

### 2. `src/config/socket.ts`
```typescript
import { Server as HttpServer } from "http";
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
    console.log(`Client connected: ${socket.id}`);

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
```

### 3. `src/config/sendMail.ts`
```typescript
import nodemailer from "nodemailer";

const sendMail = async (
  email: string,
  otp: string,
  userName?: string
): Promise<boolean> => {
  try {
    const isSmtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

    if (!isSmtpConfigured) {
      console.log("-----------------------------------------");
      console.log(`[DEV OTP NOTIFICATION] To: ${email} (${userName || "User"})`);
      console.log(`[DEV OTP NOTIFICATION] Your OTP is: ${otp}`);
      console.log("-----------------------------------------");
      return true;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${process.env.APP_NAME || "Prep-AI"}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Password Reset Request</h2>
          <p>Hello ${userName || "User"},</p>
          <p>Your 6-digit OTP code to reset your password is:</p>
          <h1 style="color: #4F46E5; letter-spacing: 4px;">${otp}</h1>
          <p>This OTP is valid for 5 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Error sending email OTP:", error);
    return false;
  }
};

export default sendMail;
```

### 4. `src/config/cloudinary.ts`
```typescript
import fs from "fs";

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
```

---

## Step 7: Migrate Middlewares (`src/middlewares/`)

### 1. `src/middlewares/errorHandler.ts`
```typescript
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

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
```

### 2. `src/middlewares/isAuthenticated.ts`
```typescript
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface AuthTokenPayload extends JwtPayload {
  userId: string;
}

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
      return;
    }

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      throw new Error("SECRET_KEY is not defined in environment variables");
    }

    const decoded = jwt.verify(token, secretKey) as AuthTokenPayload;

    if (!decoded?.userId) {
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
```

### 3. `src/middlewares/rateLimit.ts`
```typescript
import { rateLimit } from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
});

export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many OTP requests. Please wait before retrying." },
});
```

### 4. `src/middlewares/multer.ts`
```typescript
import multer from "multer";
import os from "os";

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, os.tmpdir());
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

export default upload;
```

---

## Step 8: Migrate Domain Services (`src/services/`)

### 1. `src/services/lpaService.ts`
```typescript
import { Types } from "mongoose";
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

// Backward-compatible alias matching original JS code
export const recalculateUserLPA = recalculateLPA;
```

### 2. `src/services/llmService.ts`
```typescript
// ─── OpenAI (commented out) ────────────────────────────────────────────────
// import OpenAI from "openai";
//
// let openai: OpenAI | null = null;
// const getOpenAI = (): OpenAI => {
//   if (!openai) {
//     openai = new OpenAI({
//       apiKey: process.env.OPENAI_API_KEY,
//     });
//   }
//   return openai;
// };
// ──────────────────────────────────────────────────────────────────────────────

import { GoogleGenAI } from "@google/genai";
import { TaskCategory } from "../types/index.js";

let gemini: GoogleGenAI | null = null;

const getGemini = (): GoogleGenAI => {
  if (!gemini) {
    gemini = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
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
  const prompt = `
    You are an expert Senior Software Engineer. Create a strict 4-week study roadmap for a developer aiming for a ${targetLpa} LPA job at a ${targetTier} tier company.
    
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
  `;

  // ─── OpenAI Call (commented out) ──────────────────────────────────────────
  // const client = getOpenAI();
  // const response = await client.chat.completions.create({
  //   model: "gpt-4o-mini",
  //   messages: [{ role: "system", content: prompt }],
  //   response_format: { type: "json_object" },
  // });
  // const content = response.choices[0]?.message?.content;
  // if (!content) throw new Error("Empty response received from OpenAI");
  // return JSON.parse(content) as AIRoadmapResponse;
  // ──────────────────────────────────────────────────────────────────────────

  const client = getGemini();
  const response = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  // Note: in @google/genai v2.x, response.text is a getter property string, NOT a function
  const text = response.text;
  if (!text) {
    throw new Error("Empty response received from Gemini AI service");
  }

  return JSON.parse(text) as AIRoadmapResponse;
};
```

---

## Step 9: Migrate Controllers (`src/controllers/`)

### 1. `src/controllers/userController.ts`
```typescript
import { Request, Response } from "express";
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
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
        message: `Welcome back ${user.userName}`,
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

    await sendMail(user.email, otp, user.userName);

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

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = hashValue(resetToken);
    user.resetPasswordExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    res.status(200).json({ success: true, message: "OTP verified", resetToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resetToken, password } = req.body;

    if (!resetToken || !password) {
      res.status(400).json({ success: false, message: "Reset token and new password are required" });
      return;
    }

    const user = await User.findOne({
      resetPasswordToken: hashValue(resetToken),
      resetPasswordExpiry: { $gt: new Date() },
      isoptverified: true,
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Session expired or OTP not verified. Please start over.",
      });
      return;
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.isoptverified = false;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
```

### 2. `src/controllers/roadmapController.ts`
```typescript
import { Request, Response, NextFunction } from "express";
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

    // Resolve from request body first, fallback to user profile in DB
    const resolvedTier = user.targetTier || targetTier;
    const resolvedLpa = user.targetLpa || (targetLpa ? Number(targetLpa) : undefined);

    if (!resolvedTier || !resolvedLpa) {
      res.status(400);
      throw new Error(
        "Please provide targetTier and targetLpa in the request body."
      );
    }

    // Persist to user profile if new values were supplied in the body
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
```

### 3. `src/controllers/taskController.ts`
```typescript
import { Request, Response, NextFunction } from "express";
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

    // The Gamification Trigger
    if (status === "Completed" && task.roadmapId?.userId) {
      const newLpa = await recalculateLPA(task.roadmapId.userId);

      // Emit real-time event to user's private room
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
```

---

## Step 10: Migrate Routes (`src/routes/`)

### 1. `src/routes/userRoutes.ts`
```typescript
import { Router } from "express";
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

// Password recovery flow
authRouter.post("/forgot-password", otpLimiter, forgotPassword);
authRouter.post("/verify-otp", otpLimiter, verifyOtp);
authRouter.post("/reset-password", otpLimiter, resetPassword);

export default authRouter;
```

### 2. `src/routes/roadmapRoutes.ts`
```typescript
import { Router } from "express";
import { generateRoadmap, getMyRoadmap } from "../controllers/roadmapController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const roadmapRouter: Router = Router();

roadmapRouter.get("/my-roadmap", isAuthenticated, getMyRoadmap);
roadmapRouter.post("/generate", isAuthenticated, generateRoadmap);

export default roadmapRouter;
```

### 3. `src/routes/taskRoutes.ts`
```typescript
import { Router } from "express";
import { updateTaskStatus } from "../controllers/taskController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const taskRouter: Router = Router();

taskRouter.put("/:id/status", isAuthenticated, updateTaskStatus);

export default taskRouter;
```

---

## Step 11: Migrate Entry Point (`src/index.ts`)

```typescript
import "dotenv/config";
import http from "http";
import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDb from "./config/db.js";
import errorHandler from "./middlewares/errorHandler.js";
import authRouter from "./routes/userRoutes.js";
import roadmapRouter from "./routes/roadmapRoutes.js";
import taskRouter from "./routes/taskRoutes.js";
import { initSocket } from "./config/socket.js";

const app: Application = express();
const server = http.createServer(app);

// Global Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Initialize Socket.io attached to the HTTP server
initSocket(server);

// API Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/roadmap", roadmapRouter);
app.use("/api/v1/task", taskRouter);

// Error Handling (Must be registered AFTER all routes)
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 1230;

server.listen(PORT, async () => {
  await connectDb();
  console.log(`Server is running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
```

---

## Step 12: Build, Run & Verification Protocol

### 1. Verification Without Emitting Files
Check that all types align and zero compiler diagnostics are raised:
```bash
npm run type-check
```

### 2. Run Local Development Server
Starts `tsx watch` for hot-reloading:
```bash
npm run dev
```

### 3. Build Production JavaScript
Transpiles `src/` to `dist/`:
```bash
npm run build
```

### 4. Run Production Build
Runs the compiled JavaScript using Node:
```bash
npm start
```

---

## Crucial TypeScript Gotchas & Solutions

| Gotcha / Error | Underlying Cause | Correct Solution |
| :--- | :--- | :--- |
| **`Cannot find module './config/db' or its corresponding type declarations`** | `NodeNext` ESM module resolution requires the final `.js` extension on relative imports. | Write `.js` in relative imports in `.ts` files: `import connectDb from "./config/db.js"`. TypeScript knows this maps to `./config/db.ts`. |
| **`Property 'id' does not exist on type 'Request'`** | Standard Express `Request` has no `id` property. | Create `src/types/express.d.ts` extending `Express.Request` through declaration merging. |
| **`TypeError: Cannot read properties of undefined (reading 'userId')`** | Accessing populated Mongoose fields that could be null. | Use populated generic types: `task.populate<{ roadmapId: { userId: string } }>("roadmapId")` and optional chaining `task.roadmapId?.userId`. |
| **`No overload matches this call` on `app.use(errorHandler)`** | Express `ErrorRequestHandler` requires exactly 4 arguments: `(err, req, res, next)`. | Type the middleware explicitly with `ErrorRequestHandler` from `express`. |
| **`JWT decoded type is string | JwtPayload`** | `jwt.verify()` returns `string | JwtPayload`. Accessing `.userId` fails type checking. | Cast with custom interface: `as { userId: string }`. |
| **`Mongoose Document methods missing on Plain Objects`** | Calling `.toObject()` on an object that is already plain JSON. | Verify method existence: `user.toObject ? user.toObject() : { ...user }`. |
