const Doctor = require("../models/Doctor");

// ===============================
// ADD AVAILABILITY
// ===============================
const addAvailability = async (req, res) => {
  try {
    const { date, slots } = req.body;

    if (!date || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Date and slots are required",
      });
    }

    const doctor = await Doctor.findOne({
      user: req.user._id,
      isActive: true,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const newDate = new Date(date);

    if (isNaN(newDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    const existingDate = doctor.availability.find(
      (item) =>
        new Date(item.date).toISOString().split("T")[0] ===
        newDate.toISOString().split("T")[0]
    );

    if (existingDate) {
      existingDate.slots = [
        ...new Set([...existingDate.slots, ...slots]),
      ];
    } else {
      doctor.availability.push({
        date: newDate,
        slots,
      });
    }

    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Availability added successfully",
      availability: doctor.availability,
    });
  } catch (error) {
    console.error("Add availability error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add availability",
    });
  }
};

// ===============================
// GET DOCTOR AVAILABILITY
// ===============================
const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findOne({
      _id: doctorId,
      isActive: true,
    }).select("name availability");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      doctor: doctor.name,
      availability: doctor.availability,
    });
  } catch (error) {
    console.error("Get availability error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch availability",
    });
  }
};

// ===============================
// REMOVE AVAILABILITY DATE
// ===============================
const removeAvailability = async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const doctor = await Doctor.findOne({
      user: req.user._id,
      isActive: true,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const requestedDate = new Date(date);

    doctor.availability = doctor.availability.filter(
      (item) =>
        new Date(item.date).toISOString().split("T")[0] !==
        requestedDate.toISOString().split("T")[0]
    );

    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Availability removed successfully",
      availability: doctor.availability,
    });
  } catch (error) {
    console.error("Remove availability error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove availability",
    });
  }
};

module.exports = {
  addAvailability,
  getDoctorAvailability,
  removeAvailability,
};