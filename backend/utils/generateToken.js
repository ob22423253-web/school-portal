// Token helpers. Kept tiny on purpose so the auth service doesn't have to
// repeat JWT plumbing in two places.

const jwt = require('jsonwebtoken');

// Short-lived access token used on every API request.
function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Longer-lived refresh token used to mint new access tokens.
function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

// Wrap verify so the caller doesn't have to remember which secret goes where.
function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
