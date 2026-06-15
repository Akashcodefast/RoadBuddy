const express  = require("express");
const router   = express.Router();
const { getMessages, markSeen } = require("../controllers/chat.controller");
const { protect } = require("../middleware/auth.middleware");

router.get  ("/:requestId",      protect, getMessages);
router.patch("/:requestId/seen", protect, markSeen);

module.exports = router;