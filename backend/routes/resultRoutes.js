// Result routes.
//
// GET    /api/results       - admin/lecturer/student/parent (scoped in service)
// GET    /api/results/:id   - same (scoped in service)
// POST   /api/results       - admin/lecturer
// PUT    /api/results/:id   - admin/lecturer
// DELETE /api/results/:id   - admin/lecturer

const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const ctrl = require('../controllers/resultController');

const router = express.Router();

router.use(auth);

router.get('/', ctrl.list);
router.get('/:id', [param('id').isMongoId()], validate, ctrl.getOne);

router.post(
  '/',
  roles('admin', 'lecturer'),
  [
    body('student').isMongoId().withMessage('Student id required'),
    body('course').isMongoId().withMessage('Course id required'),
    body('score').isFloat({ min: 0, max: 100 }).withMessage('Score must be 0-100'),
    body('semester').isIn(['First', 'Second']).withMessage('Semester must be First or Second'),
    body('academicYear')
      .matches(/^\d{4}\/\d{4}$/)
      .withMessage('Academic year must look like 2024/2025'),
  ],
  validate,
  ctrl.create
);

router.put(
  '/:id',
  roles('admin', 'lecturer'),
  [
    param('id').isMongoId(),
    body('score').optional().isFloat({ min: 0, max: 100 }),
    body('semester').optional().isIn(['First', 'Second']),
    body('academicYear').optional().matches(/^\d{4}\/\d{4}$/),
  ],
  validate,
  ctrl.update
);

router.delete('/:id', roles('admin', 'lecturer'), [param('id').isMongoId()], validate, ctrl.remove);

module.exports = router;
