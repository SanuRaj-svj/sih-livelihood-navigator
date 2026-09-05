const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  createIntervention,
  getInterventions,
  updateIntervention,
} = require('../controllers/interventionController');

const router = express.Router();

router.use(protect);
router.use(requireRole('OFFICER', 'ADMIN'));

router.post('/', createIntervention);
router.get('/', getInterventions);
router.patch('/:id', updateIntervention);

module.exports = router;
