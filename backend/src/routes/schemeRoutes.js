const express = require('express');
const { getSchemes, getSchemeById } = require('../controllers/schemeController');

const router = express.Router();

router.get('/', getSchemes);
router.get('/:id', getSchemeById);

module.exports = router;
