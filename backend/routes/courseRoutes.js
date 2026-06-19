// Course routes.
//
// GET    /api/courses        - any authenticated user
// GET    /api/courses/:id    - any authenticated user
// POST   /api/courses        - admin only
// PUT    /api/courses/:id    - admin only
// DELETE /api/courses/:id    - admin only

const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const ctrl = require('../controllers/courseController');

const router = express.Router();

router.use(auth);

router.get('/', ctrl.list);
router.get('/:id', [param('id').isMongoId()], validate, ctrl.getOne);

router.post(
  '/',
  roles('admin'),
  [
    body('code').trim().isLength({ min: 2, max: 12 }).withMessage('Code must be 2-12 chars'),
    body('title').trim().isLength({ min: 2, max: 120 }).withMessage('Title must be 2-120 chars'),
    body('credits').isInt({ min: 1, max: 10 }).withMessage('Credits must be 1-10'),
    body('description').optional().isLength({ max: 1000 }),
    body('lecturer').optional({ nullable: true }).custom((v) => v === null || /^[a-f\d]{24}$/i.test(v)),
  ],
  validate,
  ctrl.create
);

router.put(
  '/:id',
  roles('admin'),
  [
    param('id').isMongoId(),
    body('code').optional().trim().isLength({ min: 2, max: 12 }),
    body('title').optional().trim().isLength({ min: 2, max: 120 }),
    body('credits').optional().isInt({ min: 1, max: 10 }),
    body('description').optional().isLength({ max: 1000 }),
    body('lecturer').optional({ nullable: true }).custom((v) => v === null || /^[a-f\d]{24}$/i.test(v)),
  ],
  validate,
  ctrl.update
);

router.delete('/:id', roles('admin'), [param('id').isMongoId()], validate, ctrl.remove);

module.exports = router;
