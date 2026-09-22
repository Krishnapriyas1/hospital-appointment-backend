const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      default: "",
    },

    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    availability: [
      {
        date: {
          type: Date,
          required: true,
        },

        slots: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Doctor", doctorSchema);