const express = require('express');
const { startCall, gatherInput, recordDemoAnswer } = require('../controllers/ivrController');

const router = express.Router();

router.post('/voice', startCall);
router.post('/gather', gatherInput);
router.post('/demo-answer', recordDemoAnswer);

module.exports = router;
