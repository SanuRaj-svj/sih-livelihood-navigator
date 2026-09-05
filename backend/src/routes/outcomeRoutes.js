const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { createOutcome, getOutcomes } = require('../controllers/outcomeController');

const router = express.Router();

router.use(protect);
router.use(requireRole('OFFICER', 'ADMIN'));

router.post('/', createOutcome);
router.get('/', getOutcomes);

module.exports = router;
