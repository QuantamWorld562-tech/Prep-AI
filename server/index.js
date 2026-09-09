import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import errorHandler from "./middlewares/errorHandler.js";
import roadmapRouter from "./routes/roadmapRoutes.js";
import taskRouter from "./routes/taskRoutes.js";

dotenv.config({
  path: ".env",
});

const app = express();

app.use(express.json());
app.use(errorHandler);

//api routes
app.use('/api/v1/roadmap',roadmapRouter);
app.use('/api/v1/task',taskRouter);


const PORT = process.env.PORT;

app.listen(PORT, async () => {
  await connectDb();
  console.log(`Server is running in ${process.env.NODE_ENV} mode on ${PORT}`);
});
