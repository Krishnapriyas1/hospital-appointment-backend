const express = require("express");

const {
  addAvailability,
  getDoctorAvailability,
  removeAvailability,
} = require("../controllers/availabilityController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Public - patient can view doctor's availability
router.get("/:doctorId", getDoctorAvailability);

// Doctor only
router.post(
  "/",
  protect,
  authorize("doctor"),
  addAvailability
);

router.delete(
  "/",
  protect,
  authorize("doctor"),
  removeAvailability
);

module.exports = router;