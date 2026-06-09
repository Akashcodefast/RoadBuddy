const express = require("express");
const router  = express.Router();

const {
  createRequest,
  getMyRequests,
  getRequestById,
  cancelRequest,
} = require("../controllers/request.controller");

const { protect } = require("../middleware/auth.middleware");

router.post  ("/create",    protect, createRequest);
router.get   ("/my",        protect, getMyRequests);
router.get   ("/:id",       protect, getRequestById);
router.patch ("/:id/cancel",protect, cancelRequest);

module.exports = router;