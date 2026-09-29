const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  enrollSelf,
  getOwnEnrollments,
  updateOwnProgress,
  getAllEnrollments,
  markDroppedOut,
  confirmTrainingCompletion,
  createTrainingCheckIn,
} = require('../controllers/enrollmentController');

const router = express.Router();

router.use(protect);

// Beneficiary routes
router.post('/', enrollSelf);
router.get('/me', getOwnEnrollments);
router.patch('/:id/progress', updateOwnProgress);
router.post('/:id/check-ins', createTrainingCheckIn);
router.patch('/:id/dropout', markDroppedOut);
router.patch('/:id/complete', requireRole('OFFICER', 'ADMIN'), confirmTrainingCompletion);

// Officer / Admin route
router.get('/', requireRole('OFFICER', 'ADMIN'), getAllEnrollments);

module.exports = router;
