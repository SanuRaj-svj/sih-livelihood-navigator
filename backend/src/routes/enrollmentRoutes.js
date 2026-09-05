const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  enrollSelf,
  getOwnEnrollments,
  updateOwnProgress,
  getAllEnrollments,
} = require('../controllers/enrollmentController');

const router = express.Router();

router.use(protect);

// Beneficiary routes
router.post('/', enrollSelf);
router.get('/me', getOwnEnrollments);
router.patch('/:id/progress', updateOwnProgress);

// Officer / Admin route
router.get('/', requireRole('OFFICER', 'ADMIN'), getAllEnrollments);

module.exports = router;
