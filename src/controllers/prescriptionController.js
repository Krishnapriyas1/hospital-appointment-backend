const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// ===============================
// CREATE PRESCRIPTION
// ===============================
const createPrescription = async (req, res) => {
  try {
    const { appointment, medicines, notes, followUpDate } = req.body;

    if (
      !appointment ||
      !Array.isArray(medicines) ||
      medicines.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Appointment and medicines are required",
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

    const appointmentData = await Appointment.findOne({
      _id: appointment,
      doctor: doctor._id,
    });

    if (!appointmentData) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const existingPrescription = await Prescription.findOne({
      appointment,
    });

    if (existingPrescription) {
      return res.status(409).json({
        success: false,
        message: "Prescription already exists",
      });
    }

    const prescription = await Prescription.create({
      appointment,
      doctor: doctor._id,
      patient: appointmentData.patient,
      medicines,
      notes: notes || "",
      followUpDate: followUpDate || null,
    });

    appointmentData.status = "completed";
    await appointmentData.save();

    const result = await Prescription.findById(
      prescription._id
    )
      .populate("patient", "name email phone")
      .populate({
        path: "doctor",
        select: "name specialization",
      })
      .populate("appointment");

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription: result,
    });
  } catch (error) {
    console.error("Create prescription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create prescription",
    });
  }
};

// ===============================
// GET PATIENT PRESCRIPTIONS
// ===============================
const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patient: req.user._id,
    })
      .populate({
        path: "doctor",
        select: "name specialization image",
      })
      .populate("appointment")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error("Get prescriptions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
    });
  }
};

// ===============================
// GET PRESCRIPTION BY APPOINTMENT
// ===============================
const getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const prescription = await Prescription.findOne({
      appointment: appointmentId,
      patient: req.user._id,
    })
      .populate({
        path: "doctor",
        select: "name specialization image",
      })
      .populate("appointment");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    return res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error("Get prescription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescription",
    });
  }
};

// ===============================
// UPDATE PRESCRIPTION
// ===============================
const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      medicines,
      notes,
      followUpDate,
    } = req.body;

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

    const prescription = await Prescription.findOne({
      _id: id,
      doctor: doctor._id,
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    if (medicines !== undefined) {
      prescription.medicines = medicines;
    }

    if (notes !== undefined) {
      prescription.notes = notes;
    }

    if (followUpDate !== undefined) {
      prescription.followUpDate = followUpDate;
    }

    await prescription.save();

    return res.status(200).json({
      success: true,
      message: "Prescription updated successfully",
      prescription,
    });
  } catch (error) {
    console.error("Update prescription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update prescription",
    });
  }
};

module.exports = {
  createPrescription,
  getMyPrescriptions,
  getPrescriptionByAppointment,
  updatePrescription,
};