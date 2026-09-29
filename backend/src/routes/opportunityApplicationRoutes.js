const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  applyToOpportunity,
  getMyApplications,
  getApplicationQueue,
  updateApplicationStatus,
} = require('../controllers/opportunityApplicationController');

const router = express.Router();
router.use(protect);
router.get('/mine', getMyApplications);
router.get('/', requireRole('OFFICER', 'ADMIN'), getApplicationQueue);
router.post('/:opportunityId/apply', applyToOpportunity);
router.patch('/:id/status', updateApplicationStatus);

module.exports = router;