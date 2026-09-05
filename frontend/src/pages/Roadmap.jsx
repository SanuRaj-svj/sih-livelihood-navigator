import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import client from '../api/client';
import { CardSkeleton } from '../components/SkeletonLoader';
import { Map, BookOpen, Building2, CheckCircle2, Clock, Sparkles, Trophy, IndianRupee, Briefcase, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Roadmap = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchMyEnrollments();
  }, []);

  const fetchMyEnrollments = async () => {
    try {
      setLoading(true);
      const res = await client.get('/enrollments/me');
      if (res.data.success) {
        setEnrollments(res.data.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch journey enrollments');
    } finally {
      setLoading(false);
    }
  };

  // GSAP animation for stage progress lines & pulses
  useEffect(() => {
    if (loading || enrollments.length === 0 || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate stage progress lines
      gsap.utils.toArray('.journey-line-fill').forEach((line) => {
        const targetWidth = line.getAttribute('data-progress') || '0%';
        gsap.fromTo(
          line,
          { width: '0%' },
          { width: targetWidth, duration: 1.2, ease: 'power2.out' }
        );
      });

      // Pulse active stage badges
      gsap.to('.stage-active-pulse', {
        scale: 1.15,
        opacity: 0.8,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, enrollments]);

  const stages = [
    { key: 'RECOMMENDED', label: 'Recommended', icon: Sparkles },
    { key: 'ENROLLED', label: 'Enrolled', icon: BookOpen },
    { key: 'IN_PROGRESS', label: 'In Progress', icon: Clock },
    { key: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
    { key: 'OUTCOME', label: 'Outcome', icon: Trophy },
  ];

  const getActiveStageIndex = (enrollment) => {
    const status = enrollment.status;
    const progress = enrollment.progress;
    const outcome = enrollment.outcome;

    if (outcome) return 4; // Outcome stage
    if (status === 'COMPLETED') return 3; // Completed stage
    if (status === 'IN_PROGRESS' || (progress && progress.attendancePercentage > 0)) return 2; // In Progress stage
    if (status === 'ENROLLED') return 1; // Enrolled stage
    return 0; // Recommended stage
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ENROLLED':
        return { label: 'Enrolled', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'COMPLETED':
        return { label: 'Completed', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'DROPPED_OUT':
        return { label: 'Dropped Out', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      default:
        return { label: status, bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Map className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">My Livelihood Journey</h1>
            <p className="text-slate-400 text-sm mt-1">
              Track your training progress, module milestones, and employment outcomes in real time
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl border border-slate-800">
          <Map className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-300">No Active Enrollments Yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 mb-6">
            Browse tailored course recommendations and enroll to start your training pathway.
          </p>
          <a
            href="/recommendations"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20"
          >
            <span>Explore Recommendations</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {enrollments.map((enrollment, index) => {
            const courseName = enrollment.courseId?.courseName || 'NSQF Training Course';
            const centerName = enrollment.centerId?.name || 'Regional Skill Center';
            const centerLocation = enrollment.centerId?.district || enrollment.centerId?.address || 'Madhya Pradesh';
            const statusBadge = getStatusBadge(enrollment.status);
            const activeStageIdx = getActiveStageIndex(enrollment);
            const progressPct = ((activeStageIdx) / (stages.length - 1)) * 100;
            const progress = enrollment.progress;
            const outcome = enrollment.outcome;

            return (
              <motion.div
                key={enrollment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative space-y-6"
              >
                {/* Course Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                      {enrollment.courseId?.sector && (
                        <span className="text-xs font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-md border border-teal-500/20">
                          {enrollment.courseId.sector}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-black text-white">{courseName}</h2>
                    <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-teal-400 inline" />
                      <span>{centerName} • {centerLocation}</span>
                    </p>
                  </div>

                  {/* Attendance Pill */}
                  {progress && (
                    <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 text-right min-w-[140px]">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Attendance</span>
                      <span className="text-2xl font-black text-teal-400">
                        {progress.attendancePercentage}%
                      </span>
                    </div>
                  )}
                </div>

                {/* VISUAL JOURNEY TIMELINE */}
                <div className="py-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Visual Milestone Timeline</p>

                  <div className="relative">
                    {/* Background track line */}
                    <div className="absolute top-5 left-6 right-6 h-1 bg-slate-800 rounded-full" />

                    {/* Animated GSAP fill line */}
                    <div
                      className="journey-line-fill absolute top-5 left-6 h-1 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                      data-progress={`${progressPct}%`}
                    />

                    {/* Stages node row */}
                    <div className="relative flex justify-between items-center">
                      {stages.map((stage, sIdx) => {
                        const StageIcon = stage.icon;
                        const isPast = sIdx < activeStageIdx;
                        const isCurrent = sIdx === activeStageIdx;

                        return (
                          <div key={stage.key} className="flex flex-col items-center group">
                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all z-10 ${
                                isCurrent
                                  ? 'bg-teal-500 text-slate-950 border-teal-300 shadow-lg shadow-teal-500/30'
                                  : isPast
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                  : 'bg-slate-900 text-slate-600 border-slate-800'
                              }`}
                            >
                              <StageIcon className="w-5 h-5 stroke-[2.2]" />
                              {isCurrent && (
                                <div className="stage-active-pulse absolute w-10 h-10 rounded-2xl bg-teal-400/30 border border-teal-300 pointer-events-none" />
                              )}
                            </div>
                            <span
                              className={`text-xs font-bold mt-3 transition-colors ${
                                isCurrent
                                  ? 'text-teal-300'
                                  : isPast
                                  ? 'text-emerald-400'
                                  : 'text-slate-500'
                              }`}
                            >
                              {stage.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Additional Details & Outcome Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                  {/* Current Module & Progress Info */}
                  <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Training Module</p>
                    <p className="text-base font-extrabold text-white">
                      {progress?.currentModule || 'Orientation & Basics'}
                    </p>
                    {progress?.notes && (
                      <p className="text-xs text-slate-400 italic">"{progress.notes}"</p>
                    )}
                  </div>

                  {/* Employment Outcome Card (If exists) */}
                  {outcome ? (
                    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl p-5 border border-emerald-500/30 space-y-2 relative overflow-hidden">
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                        <Trophy className="w-4 h-4" />
                        <span>Verified Employment Outcome</span>
                      </div>
                      <p className="text-lg font-extrabold text-white">
                        {outcome.outcomeType?.replace('_', ' ')}: {outcome.employerOrBusinessName || 'Local Enterprise'}
                      </p>
                      <p className="text-sm font-bold text-teal-300 flex items-center space-x-1">
                        <IndianRupee className="w-4 h-4" />
                        <span>₹{outcome.monthlyIncome?.toLocaleString()} / month</span>
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80 flex items-center space-x-3 text-slate-400">
                      <Briefcase className="w-5 h-5 text-teal-400 shrink-0" />
                      <p className="text-xs">
                        Post-training job placement and self-employment outcomes will be verified here by your District Officer.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Roadmap;
