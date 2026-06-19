// Result service. Handles the role-aware filtering (students see only theirs,
// parents see their child's, lecturers see their courses, admin sees all)
// plus full CRUD with validation that the lecturer actually teaches the course.

const Result = require('../models/Result');
const Course = require('../models/Course');
const User = require('../models/User');

// Build a Mongo filter from request params and the calling user's role.
async function buildFilter({ user, q, course, student, semester, academicYear }) {
  const filter = {};

  // Hard scoping by role so a clever query string can't escape the user's view.
  if (user.role === 'student') {
    filter.student = user._id;
  } else if (user.role === 'parent') {
    if (!user.linkedStudent) return { __empty: true }; // marker -> return nothing
    filter.student = user.linkedStudent;
  } else if (user.role === 'lecturer') {
    // Only results for courses this lecturer teaches.
    const courses = await Course.find({ lecturer: user._id }).select('_id');
    filter.course = { $in: courses.map((c) => c._id) };
  }
  // admin sees all — no extra scoping

  if (course) filter.course = filter.course ? { ...filter.course, ...{}, $eq: course } : course;
  if (student && (user.role === 'admin' || user.role === 'lecturer')) {
    filter.student = student;
  }
  if (semester) filter.semester = semester;
  if (academicYear) filter.academicYear = academicYear;

  // The q search is a simple match on academicYear or semester text.
  if (q) {
    const rx = new RegExp(q, 'i');
    filter.$or = [{ academicYear: rx }, { semester: rx }];
  }

  return filter;
}

async function list({ user, page = 1, limit = 10, q, course, student, semester, academicYear }) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

  const filter = await buildFilter({ user, q, course, student, semester, academicYear });
  if (filter.__empty) {
    return {
      data: [],
      pagination: { page: pageNum, limit: limitNum, total: 0, totalPages: 1 },
    };
  }

  const [data, total] = await Promise.all([
    Result.find(filter)
      .populate('student', 'name email')
      .populate('course', 'code title credits')
      .populate('enteredBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Result.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

async function getById(user, id) {
  const result = await Result.findById(id)
    .populate('student', 'name email')
    .populate('course', 'code title credits lecturer')
    .populate('enteredBy', 'name email role');
  if (!result) {
    const err = new Error('Result not found');
    err.status = 404;
    throw err;
  }
  // Re-check the same scoping rules used for list.
  await assertReadable(user, result);
  return result;
}

// Confirm the caller can read a given result document.
async function assertReadable(user, result) {
  if (user.role === 'admin') return;
  if (user.role === 'student' && result.student._id.toString() === user._id.toString()) return;
  if (
    user.role === 'parent' &&
    user.linkedStudent &&
    result.student._id.toString() === user.linkedStudent.toString()
  ) {
    return;
  }
  if (user.role === 'lecturer') {
    const course = await Course.findById(result.course._id || result.course);
    if (course && course.lecturer && course.lecturer.toString() === user._id.toString()) return;
  }
  const err = new Error('You do not have access to this result');
  err.status = 403;
  throw err;
}

// Admin can create any result; a lecturer can only create for courses they teach.
async function create(user, payload) {
  const course = await Course.findById(payload.course);
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  if (user.role === 'lecturer' && (!course.lecturer || course.lecturer.toString() !== user._id.toString())) {
    const err = new Error('You can only enter results for courses you teach');
    err.status = 403;
    throw err;
  }
  const student = await User.findById(payload.student);
  if (!student || student.role !== 'student') {
    const err = new Error('Target user is not a student');
    err.status = 400;
    throw err;
  }

  const result = await Result.create({ ...payload, enteredBy: user._id });
  return result.populate([
    { path: 'student', select: 'name email' },
    { path: 'course', select: 'code title credits' },
    { path: 'enteredBy', select: 'name email role' },
  ]);
}

async function update(user, id, payload) {
  const existing = await Result.findById(id);
  if (!existing) {
    const err = new Error('Result not found');
    err.status = 404;
    throw err;
  }
  if (user.role === 'lecturer') {
    const course = await Course.findById(existing.course);
    if (!course || !course.lecturer || course.lecturer.toString() !== user._id.toString()) {
      const err = new Error('You can only edit results for your own courses');
      err.status = 403;
      throw err;
    }
  }

  // Only score/semester/academicYear are editable post-create.
  if (payload.score !== undefined) existing.score = payload.score;
  if (payload.semester !== undefined) existing.semester = payload.semester;
  if (payload.academicYear !== undefined) existing.academicYear = payload.academicYear;
  await existing.save();

  return existing.populate([
    { path: 'student', select: 'name email' },
    { path: 'course', select: 'code title credits' },
    { path: 'enteredBy', select: 'name email role' },
  ]);
}

async function remove(user, id) {
  const existing = await Result.findById(id);
  if (!existing) {
    const err = new Error('Result not found');
    err.status = 404;
    throw err;
  }
  if (user.role === 'lecturer') {
    const course = await Course.findById(existing.course);
    if (!course || !course.lecturer || course.lecturer.toString() !== user._id.toString()) {
      const err = new Error('You can only delete results for your own courses');
      err.status = 403;
      throw err;
    }
  }
  await existing.deleteOne();
  return existing;
}

module.exports = { list, getById, create, update, remove };
