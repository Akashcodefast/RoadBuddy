const User = require("../models/User");

module.exports = (io) => {

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // user comes online
    socket.on("user_online", async (userId) => {
      try {
        socket.userId = userId;
        await User.findByIdAndUpdate(userId, {
          socketId: socket.id,
          isOnline: true,
        });
        console.log(`User ${userId} is online`);
      } catch (err) {
        console.error("user_online error:", err.message);
      }
    });

    // user disconnects
    socket.on("disconnect", async () => {
      try {
        if (socket.userId) {
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            isBusy:   false,
            socketId: null,
          });
          console.log(`User ${socket.userId} went offline`);
        }
      } catch (err) {
        console.error("disconnect error:", err.message);
      }
    });

  });

};