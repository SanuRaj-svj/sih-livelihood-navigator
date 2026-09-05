const BeneficiaryProfile = require('../models/BeneficiaryProfile');
const recommendationService = require('../services/recommendation/recommendationService');

// @desc    Get rule-based recommendations for logged in beneficiary
// @route   GET /api/recommendations
// @access  Private (BENEFICIARY)
const getRecommendationsForCurrentUser = async (req, res, next) => {
  try {
    const profile = await BeneficiaryProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary profile not found. Please create your profile first.',
      });
    }

    const result = await recommendationService.getRecommendations(profile);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendationsForCurrentUser,
};
