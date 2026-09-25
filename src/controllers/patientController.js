const User = require("../models/User");

// ===============================
// ADMIN - GET ALL PATIENTS
// ===============================

const getAllPatients = async (req, res) => {
  try {
    const {
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {
      role: "patient",
    };

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const pageNumber = Math.max(parseInt(page), 1);

    const limitNumber = Math.min(
      Math.max(parseInt(limit), 1),
      100
    );

    const skip = (pageNumber - 1) * limitNumber;

    const [patients, total] = await Promise.all([
      User.find(filter)
        .select(
          "name email phone isActive createdAt"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber),

      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: patients.length,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
      patients,
    });
  } catch (error) {
    console.error(
      "Get all patients error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch patients",
    });
  }
};

module.exports = {
  getAllPatients,
};