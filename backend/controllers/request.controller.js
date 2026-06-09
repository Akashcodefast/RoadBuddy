const Request          = require("../models/Request");
const User             = require("../models/User");
const { findNearbyUsers } = require("../services/match.service");

// POST /api/requests/create
const createRequest = async (req, res) => {
  try {
    const { issueType, lat, lng, description } = req.body;
    const requesterId = req.user._id;

    // save request to DB
    const request = await Request.create({
      userId:   requesterId,
      issueType,
      location: {
        type:        "Point",
        coordinates: [lng, lat],
      },
      description: description || "",
      status:      "pending",
    });

    // find top 10 nearby online users
    const nearby = await findNearbyUsers(requesterId, lat, lng);

    if (nearby.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No users nearby right now. Try again in a few minutes.",
        requestId: request._id,
      });
    }

    // save notified users list
    request.notifiedUsers = nearby.map((u) => u._id);
    await request.save();

    // get io and notify all nearby users via socket
    const io = req.app.get("io");

    nearby.forEach((user) => {
      if (user.socketId) {
        io.to(user.socketId).emit("incoming_request", {
          requestId:     request._id,
          issueType:     request.issueType,
          description:   request.description,
          distance:      Math.round(user.distance), // metres
          requesterName: req.user.name,
          requesterPhone: req.user.phone,
          lat,
          lng,
        });
      }
    });

    res.status(201).json({
      success:   true,
      requestId: request._id,
      notified:  nearby.length,
    });

  } catch (err) {
    console.error("createRequest error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/requests/my
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("helperId", "name phone rating");

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/requests/:id
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("userId",   "name phone")
      .populate("helperId", "name phone rating");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/requests/:id/cancel
const cancelRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "cancelled";
    await request.save();

    res.json({ success: true, message: "Request cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createRequest, getMyRequests, getRequestById, cancelRequest };