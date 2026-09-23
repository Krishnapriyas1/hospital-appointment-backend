const express = require("express");

const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} = require("../controllers/appointmentController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Patient
router.post(
  "/",
  protect,
  authorize("patient"),
  createAppointment
);

router.get(
  "/my",
  protect,
  authorize("patient"),
  getMyAppointments
);

router.patch(
  "/:id/cancel",
  protect,
  authorize("patient"),
  cancelAppointment
);

// Doctor
router.get(
  "/doctor/my",
  protect,
  authorize("doctor"),
  getDoctorAppointments
);

router.patch(
  "/:id/status",
  protect,
  authorize("doctor", "admin"),
  updateAppointmentStatus
);

module.exports = router;