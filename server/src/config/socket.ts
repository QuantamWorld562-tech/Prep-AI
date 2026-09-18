import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../types/index.js";

let io: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

export const initSocket = (
  server: HttpServer,
): Server<ClientToServerEvents, ServerToClientEvents> => {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: { origin: "*" },
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
  if (!io)
    throw new Error(
      "socket.io is not initialized.  Call initSocket(server) first.",
    );

  return io;
};
