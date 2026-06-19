// User controller. Wraps userService for admin-style user management plus the
// user's own profile.

const userService = require('../services/userService');

async function list(req, res, next) {
  try {
    const { page, limit, q, role } = req.query;
    const data = await userService.list({ page, limit, q, role });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const user = await userService.getById(req.params.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const user = await userService.create(req.body);
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const user = await userService.update(req.params.id, req.body);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await userService.remove(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
}

// "View my own profile" — pulled out so it doesn't require admin role.
async function me(req, res, next) {
  try {
    const user = await userService.getById(req.user._id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove, me };
