// Auth controller. Thin layer that translates request -> service call -> response.

const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const payload = await authService.register({ name, email, password });
    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const payload = await authService.login({ email, password });
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const payload = await authService.refresh(refreshToken);
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

// Return the currently authenticated user (auth middleware put it on req.user).
async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, refresh, me };
