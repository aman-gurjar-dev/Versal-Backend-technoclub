const User = require("../models/user");

const admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking admin privileges",
      error: error.message,
    });
  }
};

module.exports = admin;
