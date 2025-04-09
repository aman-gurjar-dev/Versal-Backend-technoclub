const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter project title"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please enter project description"],
  },
  technologies: [
    {
      type: String,
      required: true,
    },
  ],
  image: {
    type: String,
    required: false,
  },
  githubLink: {
    type: String,
    required: false,
  },
  demoLink: {
    type: String,
    required: false,
  },
  team: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Project", projectSchema);
