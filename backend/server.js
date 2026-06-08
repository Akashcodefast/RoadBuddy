const express    = require("express");
const http       = require("http");
const { Server } = require("socket.io");
const cors       = require("cors");
const helmet     = require("helmet");
const morgan     = require("morgan");
require("dotenv").config();

const connectDB      = require("./config/db");
const initSocket     = require("./config/socket");
const locationSocket = require("./sockets/location.socket");

const authRoutes = require("./routes/auth.routes");

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

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.json({ message: "RoadBuddy API running" }));

// init all socket handlers
initSocket(io);
locationSocket(io);

connectDB().then(() => {
  server.listen(5000, () => {
    console.log(`Server running on port 5000`);
  });
});