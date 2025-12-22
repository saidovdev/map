const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("send-location", (data) => {
    // location handling
  });
});

server.listen(3000, () => {
  console.log("Server running on 3000");
});
