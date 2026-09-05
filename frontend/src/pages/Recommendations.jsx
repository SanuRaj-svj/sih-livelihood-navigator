import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCounter from '../components/AnimatedCounter';
import client from '../api/client';
import { CardSkeleton } from '../components/SkeletonLoader';
import { Sparkles, BookOpen, Building2, Briefcase, CheckCircle2, ArrowRight, MapPin, Award, Layers, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Recommendations = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [centers, setCenters] = useState([]);
  const [filter, setFilter] = useState('ALL');

  // Modal State for Enrollment
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCenterId, setSelectedCenterId] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchRecommendationsAndCenters();
  }, []);

  const fetchRecommendationsAndCenters = async () => {
    try {
      setLoading(true);
      const [recRes, centerRes] = await Promise.all([
        client.get('/recommendations').catch((err) => err.response || { data: { success: false } }),
        client.get('/centres').catch((err) => err.response || { data: { success: false, data: [] } }),
      ]);

      if (recRes?.data?.success) {
        const recList = recRes.data.data?.recommendations || recRes.data.data || [];
        setRecommendations(Array.isArray(recList) ? recList : []);
      } else {
        setRecommendations([]);
        if (recRes?.status === 404) {
          toast.error('Please complete your profile first');
          navigate('/profile');
          return;
        }
      }

      if (centerRes?.data?.success) {
        setCenters(Array.isArray(centerRes.data.data) ? centerRes.data.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      toast.error('Failed to load recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEnrollModal = (item) => {
    setSelectedCourse(item);
    // Auto-select first center if available
    if (centers.length > 0) {
      setSelectedCenterId(centers[0]._id);
    }
  };

  const handleConfirmEnroll = async () => {
    if (!selectedCourse || !selectedCenterId) {
      toast.error('Please select a training center');
      return;
    }

    setEnrolling(true);
    try {
      const res = await client.post('/enrollments', {
        courseId: selectedCourse.id,
        centerId: selectedCenterId,
      });

      if (res.data.success) {
        toast.success(`Successfully enrolled in ${selectedCourse.details.courseName}!`);
        setSelectedCourse(null);
        navigate('/roadmap');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    if (filter === 'ALL') return true;
    return r.type === filter;
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case 'COURSE':
        return { label: 'NSQF Course', bg: 'bg-teal-500/20 text-teal-300 border-teal-500/30', icon: BookOpen };
      case 'CENTER':
        return { label: 'Training Centre', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', icon: Building2 };
      case 'OPPORTUNITY':
        return { label: 'Job / Market', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Briefcase };
      default:
        return { label: type, bg: 'bg-slate-800 text-slate-300 border-slate-700', icon: Sparkles };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="glass-panel rounded-3xl p-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Recommendation Engine v1.0</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Personalized Livelihood Pathways
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl text-sm sm:text-base">
              Matched tailored courses, regional training centers, and local employment opportunities based on your skills and location.
            </p>
          </div>

          <Link to="/profile">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center space-x-2 whitespace-nowrap shadow-lg"
            >
              <span>Update Profile</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        {[
          { key: 'ALL', label: 'All Recommendations', icon: Layers },
          { key: 'COURSE', label: 'NSQF Courses', icon: BookOpen },
          { key: 'CENTER', label: 'Training Centres', icon: Building2 },
          { key: 'OPPORTUNITY', label: 'Employment Opportunities', icon: Briefcase },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = filter === tab.key;
          return (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold border-teal-400 shadow-lg shadow-teal-500/20'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Grid of Recommendation Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredRecs.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl border border-slate-800">
          <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-300">No Recommendations Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
            Try adjusting your profile skills or location preferences to unlock more tailored opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecs.map((item, index) => {
            const badge = getTypeBadge(item?.type);
            const BadgeIcon = badge.icon;
            const matchScorePct = Math.round((item?.score || 0) * 100);
            const title = item?.details?.courseName || item?.details?.name || item?.details?.title || 'Opportunity';
            const reasons = Array.isArray(item?.reasons) ? item.reasons : [];

            return (
              <motion.div
                key={(item?.id || index) + '-' + index}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
                whileHover={{ y: -4 }}
                className="glass-card rounded-3xl p-6 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between shadow-xl relative overflow-hidden group"
              >
                <div>
                  {/* Top Badge & Score */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${badge.bg}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>

                    {/* Animated Match Score Pill */}
                    <div className="text-right">
                      <div className="inline-flex items-center space-x-1 text-sm font-black text-teal-400 bg-teal-500/10 px-3 py-1 rounded-xl border border-teal-500/20">
                        <span>Match:</span>
                        <AnimatedCounter start={0} end={matchScorePct} duration={1.2} suffix="%" />
                      </div>
                    </div>
                  </div>

                  {/* Score Progress Bar Fill */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${matchScorePct}%` }}
                      transition={{ duration: 1, delay: 0.2 + index * 0.08 }}
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                    />
                  </div>

                  {/* Title & Details */}
                  <h3 className="text-lg font-extrabold text-white group-hover:text-teal-300 transition-colors">
                    {title}
                  </h3>

                  {item?.details?.sector && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5 text-teal-400 inline" />
                      <span>Sector: {item.details.sector}</span>
                    </p>
                  )}

                  {item?.details?.address && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-400 inline" />
                      <span>{item.details.address}</span>
                    </p>
                  )}

                  {/* Reasons list */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Why Recommended:</p>
                    {reasons.slice(0, 2).map((reason, rIdx) => (
                      <div key={rIdx} className="flex items-start space-x-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-between items-center">
                  {item.type === 'COURSE' ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOpenEnrollModal(item)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 flex items-center justify-center space-x-1.5"
                    >
                      <span>Enroll in Training</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  ) : (
                    <button
                      onClick={() => toast.success(`Saved ${item.details.name || item.details.title} to bookmarks`)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Enrollment Confirmation Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Course Enrollment</h3>
                  <p className="text-xs text-slate-400">Confirm your training center selection</p>
                </div>
              </div>

              <div className="space-y-4 my-6">
                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
                  <p className="text-xs text-teal-400 font-bold uppercase tracking-wider">Selected Course</p>
                  <p className="text-base font-extrabold text-white mt-1">{selectedCourse.details.courseName}</p>
                  <p className="text-xs text-slate-400 mt-1">Sector: {selectedCourse.details.sector} | NSQF Level {selectedCourse.details.nsqfLevel || '4'}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Select Regional Training Center</label>
                  {centers.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No specific centers loaded. Using default regional hub.</p>
                  ) : (
                    <select
                      value={selectedCenterId}
                      onChange={(e) => setSelectedCenterId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                    >
                      {centers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} - {c.district || c.address}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedCourse(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={enrolling}
                  onClick={handleConfirmEnroll}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 flex items-center space-x-2 disabled:opacity-50"
                >
                  {enrolling ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Confirm & Enroll</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Recommendations;
