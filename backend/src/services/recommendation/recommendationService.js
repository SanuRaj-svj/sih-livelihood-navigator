const NSQFCourse = require('../../models/NSQFCourse');
const TrainingCenter = require('../../models/TrainingCenter');
const Opportunity = require('../../models/Opportunity');

/**
 * Heuristic Rule-Based Recommendation Engine
 * Fallback implementation prior to AI integration contract.
 *
 * @param {Object} beneficiaryProfile - BeneficiaryProfile document
 * @returns {Object} { recommendations: Array, modelVersion: String, generatedAt: Date }
 */
const getRecommendations = async (beneficiaryProfile) => {
  const recommendations = [];

  const userEducation = beneficiaryProfile.education?.level || '';
  const userInterests = beneficiaryProfile.interests || [];
  const userSkills = beneficiaryProfile.skills || [];
  const userCoords = beneficiaryProfile.location?.coordinates?.coordinates || [0, 0];
  const maxDistanceKm = beneficiaryProfile.mobility?.maxDistanceKm || 50;
  const maxDistanceMeters = maxDistanceKm * 1000;

  const combinedUserPreferences = [
    ...userInterests.map((i) => i.toLowerCase()),
    ...userSkills.map((s) => s.toLowerCase()),
  ];

  // 1. NSQF Courses Recommendation
  const courses = await NSQFCourse.find({});
  for (const course of courses) {
    let score = 0.5; // Base score
    const reasons = [];

    // Sector match
    const courseSectorLower = (course.sector || '').toLowerCase();
    const sectorMatched = combinedUserPreferences.some(
      (pref) => pref.includes(courseSectorLower) || courseSectorLower.includes(pref)
    );
    if (sectorMatched) {
      score += 0.25;
      reasons.push(`Sector '${course.sector}' aligns with your interests/skills`);
    } else {
      reasons.push(`Course available in '${course.sector}' sector`);
    }

    // Education match (loose)
    if (userEducation && course.requiredEducation) {
      const courseEduLower = course.requiredEducation.toLowerCase();
      const userEduLower = userEducation.toLowerCase();
      if (userEduLower.includes(courseEduLower) || courseEduLower.includes(userEduLower)) {
        score += 0.25;
        reasons.push(`Education level '${course.requiredEducation}' matches your background`);
      }
    }

    score = Math.min(Math.round(score * 100) / 100, 1.0);

    recommendations.push({
      type: 'COURSE',
      id: course._id,
      score,
      reasons,
      details: {
        courseName: course.courseName,
        qualificationName: course.qualificationName,
        sector: course.sector,
        nsqfLevel: course.nsqfLevel,
        duration: course.duration,
      },
    });
  }

  // Helper for distance formula (Haversine in KM)
  const haversineDistanceKm = (coords1, coords2) => {
    const [lon1, lat1] = coords1;
    const [lon2, lat2] = coords2;
    if (!lon1 || !lat1 || !lon2 || !lat2) return 999;
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 2. Training Centers Proximity Recommendation
  let centers = [];
  const hasValidCoords = userCoords[0] !== 0 || userCoords[1] !== 0;

  if (hasValidCoords) {
    try {
      centers = await TrainingCenter.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: userCoords },
            $maxDistance: maxDistanceMeters,
          },
        },
      }).populate('coursesOffered');
    } catch (err) {
      // Fallback if 2dsphere index query fails
      centers = await TrainingCenter.find({}).populate('coursesOffered');
    }
  } else {
    centers = await TrainingCenter.find({}).populate('coursesOffered');
  }

  for (const center of centers) {
    let score = 0.5;
    const reasons = [];

    const centerCoords = center.location?.coordinates || [0, 0];
    const distKm = haversineDistanceKm(userCoords, centerCoords);

    if (distKm <= maxDistanceKm) {
      score += 0.3;
      reasons.push(`Center located ${distKm.toFixed(1)} km away (within ${maxDistanceKm} km range)`);
    } else {
      reasons.push(`Training center located ${distKm.toFixed(1)} km away`);
    }

    // Check if offers courses matching user preferences
    const matchingCourses = (center.coursesOffered || []).filter((c) =>
      combinedUserPreferences.some(
        (pref) => (c.sector || '').toLowerCase().includes(pref) || pref.includes((c.sector || '').toLowerCase())
      )
    );

    if (matchingCourses.length > 0) {
      score += 0.2;
      reasons.push(`Offers ${matchingCourses.length} course(s) matching your interests`);
    }

    score = Math.min(Math.round(score * 100) / 100, 1.0);

    recommendations.push({
      type: 'CENTER',
      id: center._id,
      score,
      reasons,
      details: {
        name: center.name,
        address: center.address,
        capacity: center.capacity,
        coursesCount: (center.coursesOffered || []).length,
      },
    });
  }

  // 3. Opportunities Proximity & Sector Recommendation
  let opportunities = [];
  if (hasValidCoords) {
    try {
      opportunities = await Opportunity.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: userCoords },
            $maxDistance: maxDistanceMeters,
          },
        },
      });
    } catch (err) {
      opportunities = await Opportunity.find({});
    }
  } else {
    opportunities = await Opportunity.find({});
  }

  for (const opp of opportunities) {
    let score = 0.5;
    const reasons = [];

    const oppCoords = opp.location?.coordinates || [0, 0];
    const distKm = haversineDistanceKm(userCoords, oppCoords);

    if (distKm <= maxDistanceKm) {
      score += 0.3;
      reasons.push(`Opportunity located ${distKm.toFixed(1)} km away`);
    }

    const oppSectorLower = (opp.sector || '').toLowerCase();
    if (combinedUserPreferences.some((pref) => pref.includes(oppSectorLower) || oppSectorLower.includes(pref))) {
      score += 0.2;
      reasons.push(`Job sector '${opp.sector}' matches your skills/interests`);
    }

    score = Math.min(Math.round(score * 100) / 100, 1.0);

    recommendations.push({
      type: 'OPPORTUNITY',
      id: opp._id,
      score,
      reasons,
      details: {
        title: opp.title,
        type: opp.type,
        sector: opp.sector,
        description: opp.description,
      },
    });
  }

  // Sort overall recommendations by score descending
  recommendations.sort((a, b) => b.score - a.score);

  return {
    recommendations,
    modelVersion: 'rule-based-v1',
    generatedAt: new Date(),
  };
};

module.exports = {
  getRecommendations,
};
