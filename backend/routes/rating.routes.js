const express = require("express");
const router  = express.Router();
const { createRating, checkRating } = require("../controllers/rating.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/create",         protect, createRating);
router.get ("/check/:requestId", protect, checkRating);

module.exports = router;