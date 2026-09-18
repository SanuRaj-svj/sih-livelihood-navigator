const BeneficiaryProfile = require('../models/BeneficiaryProfile');
const TrainingCenter = require('../models/TrainingCenter');
const NSQFCourse = require('../models/NSQFCourse');
const mongoose = require('mongoose');
const recommendationService = require('../services/recommendation/recommendationService');
const { assessLivelihood } = require('../services/ai/livelihoodAssessmentClient');

const normalizedText = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const textMatches = (left, right) => {
  const first = normalizedText(left);
  const second = normalizedText(right);
  if (!first || !second) return false;
  if (first.includes(second) || second.includes(first)) return true;
  const ignored = new Set(['and', 'the', 'for', 'with', 'home', 'general']);
  const firstTokens = new Set(first.split(' ').filter((token) => token.length >= 4 && !ignored.has(token)));
  return second.split(' ').some((token) => token.length >= 4 && !ignored.has(token) && firstTokens.has(token));
};

const liveCourseRecommendations = async (profile) => {
  const profileTerms = [
    ...(profile.skills || []),
    ...(profile.traditionalSkills || []),
    ...(profile.interests || []),
    ...(profile.aspirations || []),
  ].filter(Boolean);
  if (!profileTerms.length) return [];

  const courses = await NSQFCourse.find({}).lean();
  return courses
    .map((course) => {
      const requiredMatches = (course.requiredSkills || []).filter((skill) =>
        profileTerms.some((term) => textMatches(term, skill)),
      );
      const acquiredMatches = (course.acquiredSkills || []).filter((skill) =>
        profileTerms.some((term) => textMatches(term, skill)),
      );
      const contextMatches = [course.courseName, course.sector].filter((field) =>
        profileTerms.some((term) => textMatches(term, field)),
      );
      const matchCount = requiredMatches.length + acquiredMatches.length + contextMatches.length;
      if (!matchCount) return null;

      const denominator = Math.max((course.requiredSkills || []).length, 1);
      const score = Math.min(1, 0.55 + (requiredMatches.length / denominator) * 0.3 + Math.min(acquiredMatches.length, 2) * 0.05);
      return {
        type: 'COURSE',
        id: course._id,
        score: Math.round(score * 100) / 100,
        reasons: [
          `Matched live NSQF course data from ${course.sector || 'the course catalog'}`,
          ...requiredMatches.map((skill) => `Matches your skill: ${skill}`),
          ...acquiredMatches.slice(0, 2).map((skill) => `Builds on your experience: ${skill}`),
        ],
        details: {
          courseId: String(course._id),
          courseName: course.courseName,
          qualificationName: course.qualificationName,
          sector: course.sector,
          nsqfLevel: course.nsqfLevel,
          duration: course.duration,
          liveCatalogMatch: true,
        },
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
};

const normalizeRecommendationResult = (result, source) => ({
  recommendations: result.recommendations || [],
  modelVersion: result.modelVersion || 'unknown',
  generatedAt: result.generatedAt || new Date().toISOString(),
  assessmentStatus: result.assessmentStatus || 'completed',
  limitations: result.limitations || [],
  fallbackReason: result.fallbackReason || null,
  source,
});

const attachTrainingCenters = async (result) => {
  const courseIds = result.recommendations
    .map((recommendation) => recommendation.details?.courseId)
    .filter((courseId) => mongoose.Types.ObjectId.isValid(courseId));
  const courseNames = result.recommendations
    .map((recommendation) => recommendation.details?.courseName)
    .filter(Boolean);
  const sectors = result.recommendations
    .map((recommendation) => recommendation.details?.sector)
    .filter(Boolean);
  let matchingCourses = await NSQFCourse.find({
    $or: [
      ...(courseIds.length ? [{ _id: { $in: courseIds } }] : []),
      ...(courseNames.length ? [{ courseName: { $in: courseNames } }] : []),
      ...(sectors.length ? [{ sector: { $in: sectors } }] : []),
    ],
  }).select('_id courseName sector').lean();
  if (!matchingCourses.length) {
    matchingCourses = await NSQFCourse.find({}).select('_id courseName sector').lean();
  }
  const matchingCourseIds = matchingCourses.map((course) => course._id);
  const centers = await TrainingCenter.find(
    matchingCourseIds.length ? { coursesOffered: { $in: matchingCourseIds } } : {},
  ).populate('coursesOffered', 'courseName qualificationName sector').lean();

  return {
    ...result,
    recommendations: result.recommendations.map((recommendation) => {
      const courseName = normalizedText(recommendation.details?.courseName);
      const sector = normalizedText(recommendation.details?.sector);
      const linkedCourse = matchingCourses.find((course) =>
        (recommendation.details?.courseId && String(course._id) === String(recommendation.details.courseId))
        || textMatches(courseName, course.courseName)
        || textMatches(sector, course.sector)
      );
      const trainingCenters = centers
        .filter((center) => (center.coursesOffered || []).some((course) => {
          const offeredName = normalizedText(course.courseName || course.qualificationName);
          const offeredSector = normalizedText(course.sector);
          return textMatches(courseName, offeredName) || textMatches(sector, offeredSector);
        }) || textMatches(sector, center.name) || textMatches(courseName, center.name))
        .map((center) => ({
          _id: center._id,
          name: center.name,
          address: center.address,
          capacity: center.capacity,
          contactInfo: center.contactInfo,
        }));

      return {
        ...recommendation,
        details: {
          ...recommendation.details,
          courseId: linkedCourse?._id ? String(linkedCourse._id) : null,
          trainingCenters,
        },
      };
    }),
  };
};

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

    let result;
    let source = 'ai-assessment';

    try {
      result = await assessLivelihood(profile);
      const liveCourses = await liveCourseRecommendations(profile);
      result = {
        ...result,
        recommendations: [...liveCourses, ...(result.recommendations || [])]
          .filter((recommendation, index, all) => all.findIndex((item) => (
            String(item.details?.courseId || item.details?.courseName || item.id)
            === String(recommendation.details?.courseId || recommendation.details?.courseName || recommendation.id)
          )) === index)
          .slice(0, 3),
      };
      result = await attachTrainingCenters(result);
    } catch (aiError) {
      source = 'rule-based-fallback';
      console.warn(`AI assessment unavailable: ${aiError.message}`);
      result = await recommendationService.getRecommendations(profile);
      result = {
        ...result,
        limitations: [
          ...(result.limitations || []),
          'AI assessment was unavailable; rule-based recommendations are shown.',
        ],
        fallbackReason: 'ai_service_unavailable',
      };
    }

    res.status(200).json({
      success: true,
      data: normalizeRecommendationResult(result, source),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendationsForCurrentUser,
};
