const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "..", "uploads", "events");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Images only!"));
    }
  },
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
});

// Get event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching event",
      error: error.message,
    });
  }
});

// Register for an event
router.post("/:id/register", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if event is upcoming
    if (event.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: "Cannot register for completed events",
      });
    }

    // Check if user is already registered
    if (event.registrations.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Already registered for this event",
      });
    }

    // Add user to registrations
    event.registrations.push(req.user.id);
    await event.save();

    res.status(200).json({
      success: true,
      message: "Successfully registered for the event",
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering for event",
      error: error.message,
    });
  }
});

// Admin Routes

// Create new event (admin only)
router.post(
  "/",
  auth,
  admin,
  upload.single("image"),
  handleMulterError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload an image",
        });
      }

      const eventData = {
        ...req.body,
        image: `/uploads/events/${req.file.filename}`,
      };

      const event = await Event.create(eventData);
      res.status(201).json({
        success: true,
        event,
      });
    } catch (error) {
      // If there's an error, delete the uploaded file
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      res.status(500).json({
        success: false,
        message: "Error creating event",
        error: error.message,
      });
    }
  }
);

// Update event (admin only)
router.put("/:id", auth, admin, upload.single("image"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const eventData = {
      ...req.body,
      image: req.file ? `/uploads/events/${req.file.filename}` : event.image,
    };

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      eventData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      event: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating event",
      error: error.message,
    });
  }
});

// Delete event (admin only)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message,
    });
  }
});

module.exports = router;
