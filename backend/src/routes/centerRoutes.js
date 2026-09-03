const express = require('express');
const {
  getCenters,
  getCenterById,
  createCenter,
  updateCenter,
  deleteCenter,
} = require('../controllers/centerController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getCenters);
router.get('/:id', getCenterById);

router.post('/', protect, requireRole('OFFICER', 'ADMIN'), createCenter);
router.put('/:id', protect, requireRole('OFFICER', 'ADMIN'), updateCenter);
router.delete('/:id', protect, requireRole('OFFICER', 'ADMIN'), deleteCenter);

module.exports = router;
