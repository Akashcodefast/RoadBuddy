const User = require("../models/User");

module.exports = (io) => {

  io.on("connection", (socket) => {

    // frontend sends location every 10 seconds
    socket.on("update_location", async ({ userId, lat, lng }) => {
      try {
        await User.findByIdAndUpdate(userId, {
          location: {
            type:        "Point",
            coordinates: [lng, lat], // MongoDB needs [lng, lat]
          },
        });

        // if this user is a helper on an active job
        // broadcast their location to the requester
        if (socket.requesterId) {
          io.to(socket.requesterId).emit("helper_location", { lat, lng });
        }

      } catch (err) {
        console.error("update_location error:", err.message);
      }
    });

    // called when helper accepts — links helper socket to requester
    socket.on("link_requester", ({ requesterId }) => {
      socket.requesterId = requesterId;
    });

  });

};