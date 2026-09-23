const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Category = require("../models/Category");

// ===============================
// CREATE DOCTOR
// ===============================
const createDoctor = async (req, res) => {
  try {
    const {
      name,
      specialization,
      experience,
      image,
      username,
      password,
      email,
      phone,
      category,
      availability,
    } = req.body;

    if (
      !name ||
      !specialization ||
      experience === undefined ||
      !username ||
      !password ||
      !email ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "Required doctor fields are missing",
      });
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists || !categoryExists.isActive) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      phone,
      password,
      role: "doctor",
    });

    const doctor = await Doctor.create({
      user: user._id,
      name,
      specialization,
      experience,
      image: image || "",
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      phone: phone || "",
      category,
      availability: availability || [],
    });

    return res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      doctor,
    });
  } catch (error) {
    console.error("Create doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create doctor",
    });
  }
};

// ===============================
// GET ALL DOCTORS
// ===============================
const getDoctors = async (req, res) => {
  try {
    const {
      category,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          specialization: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const pageNumber = Math.max(parseInt(page), 1);
    const limitNumber = Math.min(
      Math.max(parseInt(limit), 1),
      50
    );

    const skip = (pageNumber - 1) * limitNumber;

    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .populate("category", "name image")
        .select("-availability")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Doctor.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
      doctors,
    });
  } catch (error) {
    console.error("Get doctors error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
};

// ===============================
// GET DOCTOR BY ID
// ===============================
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findOne({
      _id: id,
      isActive: true,
    }).populate("category", "name image");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Get doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor",
    });
  }
};

// ===============================
// UPDATE DOCTOR
// ===============================
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      specialization,
      experience,
      image,
      email,
      phone,
      category,
      availability,
      isActive,
    } = req.body;

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (category) {
      const categoryExists = await Category.findById(category);

      if (!categoryExists || !categoryExists.isActive) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      doctor.category = category;
    }

    if (name !== undefined) doctor.name = name;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (experience !== undefined) doctor.experience = experience;
    if (image !== undefined) doctor.image = image;
    if (email !== undefined) doctor.email = email.toLowerCase();
    if (phone !== undefined) doctor.phone = phone;
    if (availability !== undefined) doctor.availability = availability;
    if (isActive !== undefined) doctor.isActive = isActive;

    await doctor.save();

    // Keep User information synchronized
    const user = await User.findById(doctor.user);

    if (user) {
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email.toLowerCase();
      if (phone !== undefined) user.phone = phone;

      await user.save();
    }

    const updatedDoctor = await Doctor.findById(id).populate(
      "category",
      "name image"
    );

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error("Update doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update doctor",
    });
  }
};

// ===============================
// DELETE DOCTOR
// ===============================
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    doctor.isActive = false;

    await doctor.save();

    await User.findByIdAndUpdate(doctor.user, {
      isActive: false,
    });

    return res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    console.error("Delete doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete doctor",
    });
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};