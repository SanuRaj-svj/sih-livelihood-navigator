const express = require('express');
const { optionalProtect } = require('../middleware/authMiddleware');
const { startCall, gatherInput, recordDemoAnswer } = require('../controllers/ivrController');

const router = express.Router();

router.post('/voice', optionalProtect, startCall);
router.post('/gather', optionalProtect, gatherInput);
router.post('/demo-answer', optionalProtect, recordDemoAnswer);

module.exports = router;
