const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: "Request", required: true },
  giverId:   { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
  receiverId:{ type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
  stars:     { type: Number, min: 1, max: 5, required: true },
  review:    { type: String, default: "", trim: true },
}, { timestamps: true });

// one rating per request per giver
ratingSchema.index({ requestId: 1, giverId: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);