// Auth routes. Public except /me which needs a valid token.
//
// POST /api/auth/register  - public
// POST /api/auth/login     - public
// POST /api/auth/refresh   - public (needs refresh token in body)
// GET  /api/auth/me        - any authenticated user

const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  ctrl.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  ctrl.login
);

router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  validate,
  ctrl.refresh
);

router.get('/me', auth, ctrl.me);

module.exports = router;
