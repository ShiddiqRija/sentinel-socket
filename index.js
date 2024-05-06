const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

global.onlineAgents = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-agent", (userId) => {
    onlineAgents.set(userId, socket.id);
  });

  // Shell Event
  socket.on("send-cmd", (data) => {
    const sendUserSocket = onlineAgents.get(data.recipient);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("command", data);
    }
  });

  // Response from agent to web
  socket.on("msg-response", (data) => {
    const webUserSocket = onlineAgents.get(data.recipient);
    if (webUserSocket) {
      socket.to(webUserSocket).emit("response", data.message);
    }
  });

  socket.on("wua", (data) => {
    const webUserSocket = onlineAgents.get(data.recipient);
    if (webUserSocket) {
      socket.to(webUserSocket).emit("patches-res", data.message);
    }
  });
});

httpServer.listen(7000, () => {
  console.log("Server is listening on localhost:7000");
});
