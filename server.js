import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

const drivers = {}; // { socketId: { lat, lng } }

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("set-role", (role) => {
    socket.role = role;
    console.log(socket.id, "role:", role);

    if (role === "user") {
      socket.emit("drivers-init", drivers);
    }
  });

  socket.on("send-location", ({ latitude, longitude }) => {
    if (socket.role !== "driver") return;

    drivers[socket.id] = { latitude, longitude };

    // faqat USERlarga yuboriladi
    io.sockets.sockets.forEach((s) => {
      if (s.role === "user") {
        s.emit("driver-location", {
          id: socket.id,
          latitude,
          longitude,
        });
      }
    });
  });

  socket.on("disconnect", () => {
    delete drivers[socket.id];
    io.emit("driver-disconnected", socket.id);
  });
});

server.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
