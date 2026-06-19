// User routes.
//
// GET    /api/users/profile  - any authenticated user (own profile)
// GET    /api/users          - admin only (list)
// POST   /api/users          - admin only (create)
// GET    /api/users/:id      - admin only (single)
// PUT    /api/users/:id      - admin only (update)
// DELETE /api/users/:id      - admin only (delete)

const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const ctrl = require('../controllers/userController');

const router = express.Router();

// Own profile route must be declared before /:id so it doesn't get swallowed.
router.get('/profile', auth, ctrl.me);

router.use(auth, roles('admin'));

router.get('/', ctrl.list);

router.post(
  '/',
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'lecturer', 'student', 'parent']).withMessage('Invalid role'),
    body('linkedStudent').optional({ nullable: true }).isMongoId().withMessage('Invalid student id'),
  ],
  validate,
  ctrl.create
);

router.get('/:id', [param('id').isMongoId()], validate, ctrl.getOne);

router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('name').optional().trim().isLength({ min: 2, max: 80 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('role').optional().isIn(['admin', 'lecturer', 'student', 'parent']),
    body('linkedStudent').optional({ nullable: true }).custom((v) => v === null || /^[a-f\d]{24}$/i.test(v)),
  ],
  validate,
  ctrl.update
);

router.delete('/:id', [param('id').isMongoId()], validate, ctrl.remove);

module.exports = router;
