const Request = require("../models/Request");
const User    = require("../models/User");

module.exports = (io) => {
  io.on("connection", (socket) => {

    // helper accepts a request
    socket.on("accept_request", async ({ requestId, helperId }) => {
      try {
        const request = await Request.findById(requestId);

        if (!request) return;

        // race condition guard — already accepted by someone else
        if (request.status !== "pending") {
          socket.emit("accept_failed", {
            message: "Request already accepted by someone else",
          });
          return;
        }

        // lock the request
        request.status   = "accepted";
        request.helperId = helperId;
        await request.save();

        // mark helper as busy
        await User.findByIdAndUpdate(helperId, { isBusy: true });

        // get helper details
        const helper = await User.findById(helperId).select("name phone rating");

        // get requester socketId
        const requester = await User.findById(request.userId).select("socketId");

        // notify requester — helper is coming
        if (requester?.socketId) {
          io.to(requester.socketId).emit("request_accepted", {
            requestId:   request._id,
            helperName:  helper.name,
            helperPhone: helper.phone,
            helperRating:helper.rating,
            helperId,
          });
        }

        // link helper socket to requester for live tracking
        socket.requesterId = requester?.socketId;

        // cancel for all other notified users
        const otherUsers = request.notifiedUsers.filter(
          (id) => id.toString() !== helperId.toString()
        );

        for (const userId of otherUsers) {
          const user = await User.findById(userId).select("socketId");
          if (user?.socketId) {
            io.to(user.socketId).emit("request_closed", { requestId });
          }
        }

      } catch (err) {
        console.error("accept_request error:", err.message);
      }
    });

    // helper marks request as completed
    socket.on("complete_request", async ({ requestId, helperId }) => {
      try {
        const request = await Request.findById(requestId);
        if (!request) return;

        request.status      = "completed";
        request.completedAt = new Date();
        await request.save();

        // free up helper
        await User.findByIdAndUpdate(helperId, { isBusy: false });

        // notify both parties
        const requester = await User.findById(request.userId).select("socketId");
        if (requester?.socketId) {
          io.to(requester.socketId).emit("request_completed", { requestId });
        }

        socket.emit("request_completed", { requestId });

      } catch (err) {
        console.error("complete_request error:", err.message);
      }
    });

  });
};