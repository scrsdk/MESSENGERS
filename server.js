import { Server } from "socket.io";

const io = new Server(3001, {
  cors: {
    origin: "*",
    method: ["PUT", "POST"],
  },
  pingTimeout: 20000,
});

// Log message to indicate server is running
console.log("Socket server is running on port 3001");
