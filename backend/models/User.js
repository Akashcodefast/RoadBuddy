const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    vehicle: {
        type: { type: String, default: "" },
        number: { type: String, default: "" },
    },

    location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
    },

    isOnline: { type: Boolean, default: false },
    isBusy: { type: Boolean, default: false },
    socketId: { type: String, default: null },

    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    totalHelps: { type: Number, default: 0 },
    totalRequests: { type: Number, default: 0 },

}, { timestamps: true });

userSchema.index({ location: "2dsphere" });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.matchPassword = async function (entered) {
    return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);