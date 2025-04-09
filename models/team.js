const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  position: {
    type: String,
    required: [true, "Please enter team member position"],
  },
  department: {
    type: String,
    required: [true, "Please enter team member department"],
  },
  year: {
    type: String,
    required: [true, "Please enter academic year"],
  },
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String,
  },
  image: {
    type: String,
    required: false,
  },
  order: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("TeamMember", teamMemberSchema);
