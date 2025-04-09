const mongoose = require("mongoose");
const validator = require("validator");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  subject: {
    type: String,
    required: [true, "Please enter message subject"],
  },
  message: {
    type: String,
    required: [true, "Please enter your message"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Contact", contactSchema);
