const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  helperId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  issueType: {
    type:     String,
    enum:     ["Fuel", "Tyre", "Battery", "Breakdown", "Other"],
    required: true,
  },

  location: {
    type:        { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },

  status: {
    type:    String,
    enum:    ["pending", "accepted", "ongoing", "completed", "cancelled"],
    default: "pending",
  },

  notifiedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  description: { type: String, default: "" },
  completedAt: { type: Date,   default: null },

}, { timestamps: true });

requestSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Request", requestSchema);