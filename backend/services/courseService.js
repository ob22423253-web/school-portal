// Course service. CRUD + list with pagination/search.

const Course = require('../models/Course');

function buildFilter({ q, lecturer }) {
  const filter = {};
  if (q) {
    const rx = new RegExp(q, 'i');
    filter.$or = [{ code: rx }, { title: rx }, { description: rx }];
  }
  if (lecturer) filter.lecturer = lecturer;
  return filter;
}

async function list({ page = 1, limit = 10, q, lecturer }) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const filter = buildFilter({ q, lecturer });

  const [data, total] = await Promise.all([
    Course.find(filter)
      .populate('lecturer', 'name email role')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Course.countDocuments(filter),
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

async function getById(id) {
  const course = await Course.findById(id).populate('lecturer', 'name email role');
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  return course;
}

async function create(payload) {
  const course = await Course.create(payload);
  return course.populate('lecturer', 'name email role');
}

async function update(id, payload) {
  const course = await Course.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate('lecturer', 'name email role');
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  return course;
}

async function remove(id) {
  const course = await Course.findByIdAndDelete(id);
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  return course;
}

module.exports = { list, getById, create, update, remove };
