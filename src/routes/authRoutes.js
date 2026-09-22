const express = require("express");

const {
  requestPatientOtp,
  verifyPatientOtp,
  doctorLogin,
  adminLogin,
  getMe,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Patient authentication
router.post("/patient/request-otp", requestPatientOtp);
router.post("/patient/verify-otp", verifyPatientOtp);

// Doctor authentication
router.post("/doctor/login", doctorLogin);

// Admin authentication
router.post("/admin/login", adminLogin);

// Current logged-in user
router.get("/me", protect, getMe);

module.exports = router;
