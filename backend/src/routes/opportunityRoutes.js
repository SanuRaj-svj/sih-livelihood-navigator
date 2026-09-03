const express = require('express');
const {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} = require('../controllers/opportunityController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);

router.post('/', protect, requireRole('OFFICER', 'ADMIN'), createOpportunity);
router.put('/:id', protect, requireRole('OFFICER', 'ADMIN'), updateOpportunity);
router.delete('/:id', protect, requireRole('OFFICER', 'ADMIN'), deleteOpportunity);

module.exports = router;
