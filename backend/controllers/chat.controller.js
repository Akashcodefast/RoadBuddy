const Message = require("../models/Message");

// GET /api/chat/:requestId — fetch all messages for a request
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      requestId: req.params.requestId,
    })
      .sort({ createdAt: 1 })
      .populate("senderId",   "name")
      .populate("receiverId", "name");

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/chat/:requestId/seen — mark messages as seen
const markSeen = async (req, res) => {
  try {
    await Message.updateMany(
      {
        requestId:  req.params.requestId,
        receiverId: req.user._id,
        seen:       false,
      },
      { seen: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMessages, markSeen };