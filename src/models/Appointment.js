const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "upcoming",
        "confirmed",
        "completed",
        "cancelled",
      ],
      default: "upcoming",
    },

    reason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same doctor from being booked
// for the same date and time.
appointmentSchema.index(
  {
    doctor: 1,
    date: 1,
    time: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);