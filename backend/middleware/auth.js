// Auth middleware. Pulls the JWT off the Authorization header, verifies it,
// and attaches the matching user document to req.user for downstream handlers.

const User = require('../models/User');
const { verifyAccessToken } = require('../utils/generateToken');

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'Missing or invalid Authorization header' } });
    }

    const token = header.slice(7);
    const decoded = verifyAccessToken(token);

    // Re-fetch the user so role changes take effect immediately and revoked
    // accounts can't ride on an old token.
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ error: { message: 'Token user no longer exists' } });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: { message: 'Invalid or expired token' } });
  }
}

module.exports = auth;
