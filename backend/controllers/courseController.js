// Course controller. Wires HTTP layer to courseService.

const courseService = require('../services/courseService');

async function list(req, res, next) {
  try {
    const { page, limit, q, lecturer } = req.query;
    const data = await courseService.list({ page, limit, q, lecturer });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const course = await courseService.getById(req.params.id);
    res.json({ data: course });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const course = await courseService.create(req.body);
    res.status(201).json({ data: course });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const course = await courseService.update(req.params.id, req.body);
    res.json({ data: course });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await courseService.remove(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
