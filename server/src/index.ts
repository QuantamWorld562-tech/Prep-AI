import "dotenv/config";
import http from "http";
import express from "express";
import type { Application, Request, Response, NextFunction } from "express";
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
  }),
);
app.use(express.json());
app.use(cookieParser());

// 3. Graceful JSON Parsing Error Guard (Prevents 500 crash on malformed JSON payload)
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (
    err instanceof SyntaxError &&
    "status" in err &&
    (err as { status: unknown }).status === 400 &&
    "body" in err
  ) {
    res
      .status(400)
      .json({ success: false, message: "Invalid JSON format in request body" });
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

// 8. Connect DB before accepting traffic
const startServer = async () => {
  await connectDb();
  server.listen(PORT, () => {
    console.log(
      `Server is running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
    );
  });
};

startServer();

// 9. Graceful Process Termination (Closes DB connection & server cleanly)
const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed. Process exited cleanly.");
    process.exit(0);
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
