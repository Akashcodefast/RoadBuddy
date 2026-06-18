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
      location: { type: "Point", coordinates: [lng, lat] },
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
      { $match: { _id: { $ne: userId }, isOnline: true, isBusy: false } },
      { $sort:  { distance: 1 } },
      { $limit: 10 },
    ]);

    nearbyUsers.forEach((u) => {
      if (u.socketId) {
        io.to(u.socketId).emit("sos_alert", {
          requestId:   sosRequest._id,
          senderName:  user.name,
          senderPhone: user.phone,
          lat, lng,
          message: message || "SOS Emergency!",
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

// PATCH /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, vehicleType, vehicleNumber } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name)  user.name  = name;
    if (phone) user.phone = phone;
    if (vehicleType)   user.vehicle.vehicleType   = vehicleType;
    if (vehicleNumber) user.vehicle.vehicleNumber = vehicleNumber;

    await user.save();

    const updated = await User.findById(user._id).select("-password");
    res.json(updated);

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
        const myRating = await Rating.findOne({ requestId: r._id, giverId: userId });
        return { ...r.toObject(), myRating: myRating || null };
      })
    );

    res.json(withRatings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── ADMIN ONLY ───

// GET /api/users/admin/all
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/admin/requests
const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .sort({ createdAt: -1 })
      .populate("userId",   "name phone")
      .populate("helperId", "name phone");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/admin/:id/block
const toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ success: true, isBlocked: user.isBlocked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const totalUsers      = await User.countDocuments();
    const onlineUsers     = await User.countDocuments({ isOnline: true });
    const totalRequests   = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: "pending" });
    const completedRequests = await Request.countDocuments({ status: "completed" });

    res.json({
      totalUsers,
      onlineUsers,
      totalRequests,
      pendingRequests,
      completedRequests,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  sendSOS,
  getProfile,
  updateProfile,
  getHistory,
  getAllUsers,
  getAllRequests,
  toggleUserBlock,
  getAdminStats,
};