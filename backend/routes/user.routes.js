const express  = require("express");
const router   = express.Router();
const {
  sendSOS,
  getProfile,
  updateProfile,
  getHistory,
  getAllUsers,
  getAllRequests,
  toggleUserBlock,
  getAdminStats,
} = require("../controllers/user.controller");

const { protect, adminOnly } = require("../middleware/auth.middleware");

// user routes
router.get  ("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);
router.get  ("/history", protect, getHistory);
router.post ("/sos",     protect, sendSOS);

// admin routes
router.get  ("/admin/stats",        protect, adminOnly, getAdminStats);
router.get  ("/admin/all",          protect, adminOnly, getAllUsers);
router.get  ("/admin/requests",     protect, adminOnly, getAllRequests);
router.patch("/admin/:id/block",    protect, adminOnly, toggleUserBlock);

module.exports = router;