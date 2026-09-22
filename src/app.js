const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hospital Appointment API is running",
  });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});