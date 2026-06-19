// Role guard. Use after the auth middleware to lock a route down to one or
// more roles, e.g. roles('admin') or roles('admin', 'lecturer').

function roles(...allowed) {
  return function check(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Not authenticated' } });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: { message: 'You do not have permission to do that' } });
    }
    next();
  };
}

module.exports = roles;
