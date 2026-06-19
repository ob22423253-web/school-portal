// User service. Handles admin-side user management plus profile lookups.

const User = require('../models/User');

// Build a Mongo filter from list-query params (search by name/email, role filter).
function buildFilter({ q, role }) {
  const filter = {};
  if (q) {
    const rx = new RegExp(q, 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  if (role) filter.role = role;
  return filter;
}

// Paginated list with optional search + role filter.
async function list({ page = 1, limit = 10, q, role }) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const filter = buildFilter({ q, role });

  const [data, total] = await Promise.all([
    User.find(filter)
      .populate('linkedStudent', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
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
  const user = await User.findById(id).populate('linkedStudent', 'name email');
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
}

// Create a user as admin (any role allowed, including linking a parent to a student).
async function create(payload) {
  const exists = await User.findOne({ email: payload.email });
  if (exists) {
    const err = new Error('Email already in use');
    err.status = 409;
    throw err;
  }
  // Only parents should have a linkedStudent — strip it for other roles.
  if (payload.role !== 'parent') payload.linkedStudent = null;
  const user = await User.create(payload);
  return user;
}

async function update(id, payload) {
  const user = await User.findById(id).select('+password');
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  // Allow password change only if provided; otherwise leave alone.
  const { name, email, role, password, linkedStudent } = payload;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (role !== undefined) {
    user.role = role;
    if (role !== 'parent') user.linkedStudent = null;
  }
  if (password) user.password = password; // hashed by pre-save hook
  if (linkedStudent !== undefined && user.role === 'parent') {
    user.linkedStudent = linkedStudent || null;
  }

  await user.save();
  return user;
}

async function remove(id) {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
}

module.exports = { list, getById, create, update, remove };
