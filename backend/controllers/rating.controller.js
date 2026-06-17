const Rating  = require("../models/Rating");
const User    = require("../models/User");
const Request = require("../models/Request");

// POST /api/ratings/create
const createRating = async (req, res) => {
  try {
    const { requestId, receiverId, stars, review } = req.body;
    const giverId = req.user._id;

    // check request exists and is completed
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.status !== "completed") {
      return res.status(400).json({ message: "Can only rate completed requests" });
    }

    // check already rated
    const existing = await Rating.findOne({ requestId, giverId });
    if (existing) {
      return res.status(400).json({ message: "Already rated this request" });
    }

    // save rating
    const rating = await Rating.create({
      requestId,
      giverId,
      receiverId,
      stars,
      review: review || "",
    });

    // update receiver's average rating
    const allRatings = await Rating.find({ receiverId });
    const avg = allRatings.reduce((sum, r) => sum + r.stars, 0) / allRatings.length;

    await User.findByIdAndUpdate(receiverId, {
      rating:       parseFloat(avg.toFixed(1)),
      totalRatings: allRatings.length,
    });

    // update totalHelps if receiver was the helper
    if (request.helperId?.toString() === receiverId.toString()) {
      await User.findByIdAndUpdate(receiverId, {
        $inc: { totalHelps: 1 },
      });
    }

    res.status(201).json({ success: true, rating });

  } catch (err) {
    console.error("createRating error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/ratings/check/:requestId
// check if current user already rated this request
const checkRating = async (req, res) => {
  try {
    const existing = await Rating.findOne({
      requestId: req.params.requestId,
      giverId:   req.user._id,
    });
    res.json({ rated: !!existing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createRating, checkRating };