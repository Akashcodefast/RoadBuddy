const Message = require("../models/Message");
const User    = require("../models/User");

module.exports = (io) => {
  io.on("connection", (socket) => {

    // join a request chat room
    socket.on("join_chat", ({ requestId }) => {
      socket.join(`chat_${requestId}`);
      console.log(`Socket ${socket.id} joined chat_${requestId}`);
    });

    // leave chat room
    socket.on("leave_chat", ({ requestId }) => {
      socket.leave(`chat_${requestId}`);
    });

    // send message
    socket.on("send_message", async ({
      requestId,
      senderId,
      receiverId,
      message,
    }) => {
      try {
        // save to DB
        const saved = await Message.create({
          requestId,
          senderId,
          receiverId,
          message,
          seen: false,
        });

        const populated = await saved.populate("senderId", "name");

        // broadcast to everyone in the chat room
        io.to(`chat_${requestId}`).emit("receive_message", {
          _id:        populated._id,
          requestId,
          senderId:   { _id: senderId, name: populated.senderId.name },
          receiverId,
          message:    populated.message,
          seen:       false,
          createdAt:  populated.createdAt,
        });

      } catch (err) {
        console.error("send_message error:", err.message);
      }
    });

    // typing indicator
    socket.on("typing", ({ requestId, senderName }) => {
      socket.to(`chat_${requestId}`).emit("user_typing", { senderName });
    });

    // stop typing
    socket.on("stop_typing", ({ requestId }) => {
      socket.to(`chat_${requestId}`).emit("user_stop_typing");
    });

    // mark seen
    socket.on("mark_seen", ({ requestId }) => {
      socket.to(`chat_${requestId}`).emit("messages_seen", { requestId });
    });

  });
};