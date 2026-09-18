const GovernmentScheme = require('../models/GovernmentScheme');

const getSchemes = async (req, res, next) => {
  try {
    const filter = { status: 'ACTIVE' };
    if (req.query.sector) filter.sectors = req.query.sector;
    if (req.query.group) filter.beneficiaryGroups = req.query.group;
    const schemes = await GovernmentScheme.find(filter).sort({ name: 1 });
    res.status(200).json({ success: true, count: schemes.length, data: schemes });
  } catch (error) {
    next(error);
  }
};

const getSchemeById = async (req, res, next) => {
  try {
    const scheme = await GovernmentScheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ success: false, message: 'Government scheme not found' });
    res.status(200).json({ success: true, data: scheme });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSchemes, getSchemeById };
