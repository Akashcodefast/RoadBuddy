const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, vehicleType, vehicleNumber } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name, email, phone, password,
      vehicle: {
        vehicleType:   vehicleType   || "",
        vehicleNumber: vehicleNumber || "",
      },
    });

    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      phone: user.phone,
      role:  user.role,
      token: generateToken(user._id),
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user._id),
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/auth/me
const getMe = async (req, res) => {
    res.json(req.user);
};

module.exports = { registerUser, loginUser, getMe };