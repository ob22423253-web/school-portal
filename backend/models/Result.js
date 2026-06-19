// Result model. One document = one student's score for one course in a given
// semester/year. Grade is auto-computed from score on save so we don't store
// inconsistent data.

const mongoose = require('mongoose');

// Map a numeric score to a letter grade. Kept here so it lives next to the
// schema that depends on it.
function scoreToGrade(score) {
  if (score >= 70) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'F'],
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      enum: ['First', 'Second'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      // Expects something like 2024/2025
      match: [/^\d{4}\/\d{4}$/, 'Academic year must look like 2024/2025'],
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate results for the same student/course/term combo.
resultSchema.index(
  { student: 1, course: 1, semester: 1, academicYear: 1 },
  { unique: true }
);

// Always sync the letter grade with the numeric score before saving.
resultSchema.pre('save', function syncGrade(next) {
  this.grade = scoreToGrade(this.score);
  next();
});

// findOneAndUpdate path: recompute grade if score was updated.
resultSchema.pre('findOneAndUpdate', function syncGradeOnUpdate(next) {
  const update = this.getUpdate() || {};
  const next$ = update.$set || update;
  if (typeof next$.score === 'number') {
    next$.grade = scoreToGrade(next$.score);
    if (update.$set) update.$set = next$;
    this.setUpdate(update);
  }
  next();
});

module.exports = mongoose.model('Result', resultSchema);
module.exports.scoreToGrade = scoreToGrade;
