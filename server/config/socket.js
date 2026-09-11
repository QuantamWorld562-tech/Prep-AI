import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("joinRoom", (userId) => {
      socket.join(userId);
    });
  });
  return io;
};

export const getIo = () => {
  if (!io) throw new Error("socket.io is not initialized");

  return io;
};
