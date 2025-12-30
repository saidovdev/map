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

/* 🔹 ROUTES */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views/user.html"));
});

app.get("/driver", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views/driver.html"));
});

/* 🔹 SOCKET STATE */
const drivers = {}; // { socketId: { lat, lng } }

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  /* DRIVER REGISTER */
  socket.on("register-driver", () => {
    socket.role = "driver";
    drivers[socket.id] = null;
    console.log("Driver registered:", socket.id);
  });

  /* USER REGISTER */
  socket.on("register-user", () => {
    socket.role = "user";
    console.log("User registered:", socket.id);

    // user ulansa, hozirgi driverlarni yuboramiz
    socket.emit("drivers-update", drivers);
  });

  /* DRIVER LOCATION */
  socket.on("send-location", ({ latitude, longitude }) => {
    if (socket.role !== "driver") return;

    drivers[socket.id] = { latitude, longitude };

    // faqat userlarga yuboriladi
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
    console.log("Disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
