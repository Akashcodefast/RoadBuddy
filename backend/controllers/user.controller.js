const User    = require("../models/User");
const Request = require("../models/Request");
const Rating  = require("../models/Rating");

// POST /api/users/sos
const sendSOS = async (req, res) => {
  try {
    const { lat, lng, message } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const io = req.app.get("io");

    const sosRequest = await Request.create({
      userId,
      issueType:   "Other",
      description: message || "🆘 SOS EMERGENCY — Needs immediate help!",
      location: {
        type:        "Point",
        coordinates: [lng, lat],
      },
      status: "pending",
    });

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

    nearbyUsers.forEach((u) => {
      if (u.socketId) {
        io.to(u.socketId).emit("sos_alert", {
          requestId:   sosRequest._id,
          senderName:  user.name,
          senderPhone: user.phone,
          lat,
          lng,
          message:     message || "SOS Emergency!",
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

// GET /api/users/history
const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await Request.find({
      $or: [{ userId }, { helperId: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("userId",   "name phone rating")
      .populate("helperId", "name phone rating");

    const withRatings = await Promise.all(
      requests.map(async (r) => {
        const myRating = await Rating.findOne({
          requestId: r._id,
          giverId:   userId,
        });
        return {
          ...r.toObject(),
          myRating: myRating || null,
        };
      })
    );

    res.json(withRatings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sendSOS, getProfile, getHistory };