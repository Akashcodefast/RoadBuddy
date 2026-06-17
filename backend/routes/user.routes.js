const express  = require("express");
const router   = express.Router();
const { sendSOS, getProfile, getHistory } = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

router.get ("/profile", protect, getProfile);
router.get ("/history", protect, getHistory);
router.post("/sos",     protect, sendSOS);

module.exports = router;