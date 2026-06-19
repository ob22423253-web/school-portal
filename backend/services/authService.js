// Auth service. All business logic for register/login/refresh lives here so
// the controller can stay focused on request/response shape.

const User = require('../models/User');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/generateToken');

// Small helper that bundles the standard auth response.
function makeAuthPayload(user) {
  const safeUser = user.toJSON();
  return {
    user: safeUser,
    accessToken: signAccessToken({ sub: user._id.toString(), role: user.role }),
    refreshToken: signRefreshToken({ sub: user._id.toString() }),
  };
}

// Public registration always creates a student. Admin creation goes through
// userService.createUser instead so an admin can pick any role.
async function register({ name, email, password }) {
  const exists = await User.findOne({ email });
  if (exists) {
    const err = new Error('Email already in use');
    err.status = 409;
    throw err;
  }

  const user = await User.create({ name, email, password, role: 'student' });
  return makeAuthPayload(user);
}

// Login compares the password and issues new tokens.
async function login({ email, password }) {
  // Pull the password explicitly since the schema hides it by default.
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const ok = await user.matchPassword(password);
  if (!ok) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  return makeAuthPayload(user);
}

// Mint a fresh access token off a valid refresh token.
async function refresh(refreshToken) {
  if (!refreshToken) {
    const err = new Error('Missing refresh token');
    err.status = 400;
    throw err;
  }
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    const err = new Error('Invalid or expired refresh token');
    err.status = 401;
    throw err;
  }
  const user = await User.findById(decoded.sub);
  if (!user) {
    const err = new Error('User no longer exists');
    err.status = 401;
    throw err;
  }
  return {
    accessToken: signAccessToken({ sub: user._id.toString(), role: user.role }),
  };
}

module.exports = { register, login, refresh };
