import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors"; // Make sure to import cors

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from your frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const users = {};
const socketToRoom = {};

const receivedChunks = {};

// Use CORS middleware
app.use(cors());

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, "peerto", "build"))); // Corrected the path

// Define a catch-all route that serves the index.html file
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "peerto", "build", "index.html"));
});

io.on("connection", (socket) => {
  socket.on("join room", (roomID) => {
    // Check if the socket ID is already in the room
    if (!users[roomID]) {
      // If the room does not exist, create it and add the socket ID
      users[roomID] = [socket.id];
    } else if (!users[roomID].includes(socket.id)) {
      // If the room exists but the socket ID is not in the room, add it
      users[roomID].push(socket.id);
    }

    // Map the socket ID to the room
    socketToRoom[socket.id] = roomID;
    console.log(`User id ${socket.id} joined RoomId ${roomID}`);
    // Send all users in the room to the newly joined socket
    const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);
    socket.emit("all users", usersInThisRoom);

    // Emit the updated user count to all sockets in the room

    for (let i = 0; i < users[roomID].length; i++) {
      io.to(users[roomID][i]).emit("user count", users[roomID].length);
    }
  });

  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });

  socket.on("count no of user", (roomID) => {
    const userCount = users[roomID] ? users[roomID].length : 0; // Get the current count of users in the room
    socket.emit("user count", userCount); // Send back the user count to the requesting socket
  });

  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("file chunk", ({ roomID, chunk, index, totalChunks, fileName }) => {
    // Forward the chunk to other users in the room
    console.log(`all the the index ${index}`);
    const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);
    io.to(usersInThisRoom).emit("file chunk received", { chunk, index, totalChunks, fileName });
  });


  socket.on("start file transfer",({roomID , fileName, fileSize})=>
  {
    console.log(`file information ${fileSize}`);
    const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);
    io.to(usersInThisRoom).emit("reciving file information",{roomID , fileName, fileSize});
  });





  socket.on("disconnect", () => {
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      room = room.filter((id) => id !== socket.id);
      users[roomID] = room;
      if (room.length === 0) {
        delete users[roomID];
      }
    }
    delete socketToRoom[socket.id];
    console.log("Client disconnected", socket.id);
  });
});

server.listen(5000, () => console.log("Server is running on port 5000"));
