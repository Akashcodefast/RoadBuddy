require("dotenv").config(); // ← always first line

const express        = require("express");
const http           = require("http");
const { Server }     = require("socket.io");
const cors           = require("cors");
const helmet         = require("helmet");
const morgan         = require("morgan");

const connectDB      = require("./config/db");
const initSocket     = require("./config/socket");
const locationSocket = require("./sockets/location.socket");
const requestSocket  = require("./sockets/request.socket");

const authRoutes     = require("./routes/auth.routes");
const requestRoutes  = require("./routes/request.routes");
const chatRoutes = require("./routes/chat.routes");
const chatSocket = require("./sockets/chat.socket");
const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ["GET", "POST"] }
});

app.set("io", io);

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth",     authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => res.json({ message: "RoadBuddy API running" }));

// init socket handlers — each only once
initSocket(io);
locationSocket(io);
requestSocket(io);
chatSocket(io);

connectDB().then(() => {
  server.listen(5000, () => {
    console.log("Server running on port 5000");
  });
});