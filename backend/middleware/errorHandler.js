// Central error handler. Anything thrown or passed to next() lands here so we
// have one place to translate to HTTP responses and avoid leaking stack traces.

function errorHandler(err, req, res, _next) {
  // Mongoose validation errors -> 422 with per-field detail
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({ errors });
  }

  // Duplicate key (e.g. unique email or course code)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      error: { message: `Duplicate value for ${field}` },
    });
  }

  // Bad ObjectId in route param
  if (err.name === 'CastError') {
    return res.status(400).json({ error: { message: `Invalid ${err.path}` } });
  }

  const status = err.status || 500;
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'Something went wrong on our end'
    : err.message || 'Server error';

  // Log full detail server-side, never to the client.
  if (status >= 500) console.error('[error]', err);

  return res.status(status).json({ error: { message } });
}

module.exports = errorHandler;
