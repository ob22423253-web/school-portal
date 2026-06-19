// Result controller. Passes the calling user through to the service so the
// service can apply role-based scoping.

const resultService = require('../services/resultService');

async function list(req, res, next) {
  try {
    const { page, limit, q, course, student, semester, academicYear } = req.query;
    const data = await resultService.list({
      user: req.user,
      page,
      limit,
      q,
      course,
      student,
      semester,
      academicYear,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const result = await resultService.getById(req.user, req.params.id);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const result = await resultService.create(req.user, req.body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const result = await resultService.update(req.user, req.params.id, req.body);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await resultService.remove(req.user, req.params.id);
    res.json({ message: 'Result deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
