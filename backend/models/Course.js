// Course model. Represents a single course offering with one assigned lecturer.

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 12,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: 1,
      max: 10,
    },
    // The lecturer responsible for teaching the course. Optional so admin can
    // create a course before assigning staff.
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
