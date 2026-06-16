const User    = require("../models/User");
const Request = require("../models/Request");

// POST /api/users/sos
const sendSOS = async (req, res) => {
  try {
    const { lat, lng, message } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // get socket io
    const io = req.app.get("io");

    // create an emergency request automatically
    const sosRequest = await Request.create({
      userId:      userId,
      issueType:   "Other",
      description: message || "🆘 SOS EMERGENCY — Needs immediate help!",
      location: {
        type:        "Point",
        coordinates: [lng, lat],
      },
      status: "pending",
    });

    // notify all nearby users within 5km
    const nearbyUsers = await User.aggregate([
      {
        $geoNear: {
          near:          { type: "Point", coordinates: [lng, lat] },
          distanceField: "distance",
          maxDistance:   5000,
          spherical:     true,
        },
      },
      {
        $match: {
          _id:      { $ne: userId },
          isOnline: true,
          isBusy:   false,
        },
      },
      { $sort:  { distance: 1 } },
      { $limit: 10 },
    ]);

    // send SOS notification to all nearby
    nearbyUsers.forEach((u) => {
      if (u.socketId) {
        io.to(u.socketId).emit("sos_alert", {
          requestId:     sosRequest._id,
          senderName:    user.name,
          senderPhone:   user.phone,
          lat,
          lng,
          message:       message || "SOS Emergency!",
        });
      }
    });

    res.status(201).json({
      success:   true,
      requestId: sosRequest._id,
      notified:  nearbyUsers.length,
    });

  } catch (err) {
    console.error("SOS error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sendSOS, getProfile };