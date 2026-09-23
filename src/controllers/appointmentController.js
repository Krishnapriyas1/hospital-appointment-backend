const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

// ===============================
// BOOK APPOINTMENT
// ===============================
const createAppointment = async (req, res) => {
  try {
    const {
      doctor,
      date,
      time,
      reason,
    } = req.body;

    if (!doctor || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Doctor, date and time are required",
      });
    }

    const doctorExists = await Doctor.findOne({
      _id: doctor,
      isActive: true,
    });

    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check if the requested slot exists
    const requestedDate = new Date(date);

    const availableDate = doctorExists.availability.find((item) => {
      return (
        new Date(item.date).toISOString().split("T")[0] ===
        requestedDate.toISOString().split("T")[0]
      );
    });

    if (!availableDate || !availableDate.slots.includes(time)) {
      return res.status(400).json({
        success: false,
        message: "Selected time slot is not available",
      });
    }

    // Check duplicate booking
    const existingAppointment = await Appointment.findOne({
      doctor,
      date: requestedDate,
      time,
      status: {
        $nin: ["cancelled"],
      },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: "This appointment slot is already booked",
      });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      date: requestedDate,
      time,
      reason: reason || "",
      status: "confirmed",
    });

    const populatedAppointment = await Appointment.findById(
      appointment._id
    )
      .populate("patient", "name email phone")
      .populate({
        path: "doctor",
        select: "name specialization experience image category",
        populate: {
          path: "category",
          select: "name",
        },
      });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    // Handles duplicate index race condition
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This appointment slot is already booked",
      });
    }

    console.error("Create appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to book appointment",
    });
  }
};

// ===============================
// PATIENT APPOINTMENT HISTORY
// ===============================
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user._id,
    })
      .populate({
        path: "doctor",
        select: "name specialization experience image category",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .sort({
        date: -1,
        time: -1,
      });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
    });
  }
};

// ===============================
// DOCTOR APPOINTMENTS
// ===============================
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user._id,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const appointments = await Appointment.find({
      doctor: doctor._id,
    })
      .populate("patient", "name email phone")
      .sort({
        date: 1,
        time: 1,
      });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get doctor appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor appointments",
    });
  }
};

// ===============================
// UPDATE APPOINTMENT STATUS
// ===============================
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "upcoming",
      "confirmed",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = status;

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Update appointment status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update appointment status",
    });
  }
};

// ===============================
// CANCEL APPOINTMENT
// ===============================
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findOne({
      _id: id,
      patient: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = "cancelled";

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
    });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
};