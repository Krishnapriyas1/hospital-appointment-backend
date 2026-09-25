const express = require("express");

const {
  getAllPatients,
} = require("../controllers/patientController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin only
router.get(
  "/",
  protect,
  authorize("admin"),
  getAllPatients
);

module.exports = router;