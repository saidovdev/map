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

/*
drivers = {
  socketId: {
    latitude,
    longitude,
    name,
    phone,
    busNumber
  }
}
*/
const drivers = {};

io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  socket.on("set-role", (role) => {
    socket.role = role;
    console.log(socket.id, "role:", role);

    // USER kirganda barcha driverlarni beramiz
    if (role === "user") {
      socket.emit("drivers-init", drivers);
    }
  });

  // DRIVER start bosganda 1 marta keladi
  socket.on("driver-start", ({ name, phone, busNumber }) => {
    socket.role = "driver";

    drivers[socket.id] = {
      name,
      phone,
      busNumber,
      latitude: null,
      longitude: null,
    };

    console.log("🚍 Driver registered:", drivers[socket.id]);
  });

  // faqat location update
  socket.on("send-location", ({ latitude, longitude }) => {
    if (socket.role !== "driver") return;
    if (!drivers[socket.id]) return;

    drivers[socket.id].latitude = latitude;
    drivers[socket.id].longitude = longitude;

    // faqat USERlarga yuboriladi
    io.sockets.sockets.forEach((s) => {
      if (s.role === "user") {
        s.emit("driver-location", {
          id: socket.id,
          ...drivers[socket.id],
        });
      }
    });
  });

  socket.on("disconnect", () => {
    if (drivers[socket.id]) {
      delete drivers[socket.id];
      io.emit("driver-disconnected", socket.id);
    }
    console.log("❌ Disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
