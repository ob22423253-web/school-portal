// Tiny helper that turns express-validator's result into a clean 422 response.
// Keeps controllers free of repetitive validation boilerplate.

const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({
    field: e.path || e.param,
    message: e.msg,
  }));

  return res.status(422).json({ errors });
}

module.exports = validate;
