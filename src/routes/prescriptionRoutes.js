const express = require("express");

const {
  createPrescription,
  getMyPrescriptions,
  getPrescriptionByAppointment,
  updatePrescription,
} = require("../controllers/prescriptionController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Doctor
router.post(
  "/",
  protect,
  authorize("doctor"),
  createPrescription
);

router.put(
  "/:id",
  protect,
  authorize("doctor"),
  updatePrescription
);

// Patient
router.get(
  "/my",
  protect,
  authorize("patient"),
  getMyPrescriptions
);

router.get(
  "/appointment/:appointmentId",
  protect,
  authorize("patient"),
  getPrescriptionByAppointment
);

module.exports = router;