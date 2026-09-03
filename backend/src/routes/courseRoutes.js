const express = require('express');
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);

router.post('/', protect, requireRole('OFFICER', 'ADMIN'), createCourse);
router.put('/:id', protect, requireRole('OFFICER', 'ADMIN'), updateCourse);
router.delete('/:id', protect, requireRole('OFFICER', 'ADMIN'), deleteCourse);

module.exports = router;
