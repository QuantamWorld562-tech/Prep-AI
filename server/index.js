import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import connectDb from "./config/db.js";
import errorHandler from "./middlewares/errorHandler.js";
import roadmapRouter from "./routes/roadmapRoutes.js";
import taskRouter from "./routes/taskRoutes.js";
import { initSocket } from "./config/socket.js";
import http from "http";


import cors from "cors";
import authRouter from "./routes/userRoutes.js";

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/roadmap", roadmapRouter);
app.use("/api/v1/task", taskRouter);




app.use(errorHandler);

const PORT = process.env.PORT;

initSocket(server);

server.listen(PORT, async () => {
  await connectDb();
  console.log(`Server is running in ${process.env.NODE_ENV} mode on ${PORT}`);
});
