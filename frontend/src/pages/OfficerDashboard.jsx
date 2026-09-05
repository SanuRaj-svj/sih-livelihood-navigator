import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedCounter from '../components/AnimatedCounter';
import gsap from 'gsap';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import { LayoutDashboard, Users, GraduationCap, CheckCircle2, AlertTriangle, BarChart3, Filter, ShieldAlert, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const OfficerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [skillDemand, setSkillDemand] = useState([]);
  const [atRiskData, setAtRiskData] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const chartRef = useRef(null);

  // Role Protection check
  useEffect(() => {
    if (user && user.role !== 'OFFICER' && user.role !== 'ADMIN') {
      toast.error('Access restricted to Officers & Administrators');
      navigate('/recommendations');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDistrict]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const districtQuery = selectedDistrict ? `?district=${encodeURIComponent(selectedDistrict)}` : '';

      const [sumRes, demandRes, riskRes] = await Promise.all([
        client.get(`/admin/dashboard/summary${districtQuery}`),
        client.get('/admin/dashboard/skill-demand'),
        client.get('/admin/dashboard/at-risk'),
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.data);
      if (demandRes.data.success) setSkillDemand(demandRes.data.data || []);
      if (riskRes.data.success) setAtRiskData(riskRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // GSAP bar chart timeline growth animation
  useEffect(() => {
    if (loading || skillDemand.length === 0 || !chartRef.current) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray('.bar-chart-fill').forEach((bar, index) => {
        const targetWidth = bar.getAttribute('data-width') || '0%';
        gsap.fromTo(
          bar,
          { width: '0%' },
          { width: targetWidth, duration: 1, delay: index * 0.1, ease: 'power2.out' }
        );
      });
    }, chartRef);

    return () => ctx.revert();
  }, [loading, skillDemand]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  const maxEnrollmentCount = Math.max(...skillDemand.map((d) => d.enrollmentCount || 1), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="glass-panel rounded-3xl p-8 border border-slate-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <LayoutDashboard className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-black text-white tracking-tight">District Officer Command</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                {user?.role}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">Real-time livelihood metrics, skill demand analytics, and risk interventions</p>
          </div>
        </div>

        {/* District Filter Selector */}
        <div className="flex items-center space-x-3 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800">
          <Filter className="w-4 h-4 text-teal-400 shrink-0 ml-1" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-transparent text-sm font-semibold text-slate-200 outline-none pr-4"
          >
            <option value="" className="bg-slate-900">All Districts</option>
            <option value="Bhopal" className="bg-slate-900">Bhopal</option>
            <option value="Indore" className="bg-slate-900">Indore</option>
            <option value="Ujjain" className="bg-slate-900">Ujjain</option>
            <option value="Gwalior" className="bg-slate-900">Gwalior</option>
          </select>
        </div>
      </div>

      {/* STAT CARDS (CountUp Animated) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Beneficiaries',
            val: summary?.totalBeneficiaries || 0,
            icon: Users,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20',
          },
          {
            title: 'Active Enrollments',
            val: summary?.activeEnrollments || 0,
            icon: GraduationCap,
            color: 'text-teal-400',
            bg: 'bg-teal-500/10 border-teal-500/20',
          },
          {
            title: 'Completed Trainings',
            val: summary?.completedTrainings || 0,
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
          },
          {
            title: 'Open Interventions',
            val: summary?.openInterventions || 0,
            icon: AlertTriangle,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.title}</p>
                <div className={`text-3xl font-black ${stat.color}`}>
                  <AnimatedCounter start={0} end={stat.val} duration={1.5} />
                </div>
              </div>

              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* SKILL DEMAND BAR CHART (GSAP Timeline Animated) */}
      <div ref={chartRef} className="glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Regional Skill Demand Analytics</h2>
              <p className="text-xs text-slate-400">Training enrollment distribution grouped by NSQF sector</p>
            </div>
          </div>
        </div>

        {skillDemand.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm italic">
            No sector enrollment data currently available.
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            {skillDemand.map((item, index) => {
              const widthPct = Math.round((item.enrollmentCount / maxEnrollmentCount) * 100);

              return (
                <div key={item.sector + index} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-200">{item.sector}</span>
                    <span className="text-teal-400 font-mono">
                      <AnimatedCounter start={0} end={item.enrollmentCount} duration={1.2} /> enrollments
                    </span>
                  </div>

                  <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bar-chart-fill h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-300 rounded-full"
                      data-width={`${widthPct}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AT-RISK BENEFICIARIES & INTERVENTIONS SECTION */}
      {atRiskData && (
        <div className="glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-extrabold text-white">At-Risk Beneficiaries & Dropout Alerts</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              {atRiskData.totalAtRiskCount || 0} Flagged
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Low Attendance List */}
            <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Low Attendance (&lt; 50%)</h3>
              {atRiskData.lowAttendanceEnrollments?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No low-attendance alerts.</p>
              ) : (
                <div className="space-y-3">
                  {atRiskData.lowAttendanceEnrollments?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div>
                        <p className="text-sm font-bold text-white">
                          {item.enrollmentId?.beneficiaryId?.userId?.name || 'Beneficiary'}
                        </p>
                        <p className="text-xs text-slate-400">{item.enrollmentId?.courseId?.courseName}</p>
                      </div>
                      <span className="text-xs font-black text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                        {item.attendancePercentage}% Att.
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* High Risk Interventions */}
            <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">High Risk Interventions</h3>
              {atRiskData.highRiskInterventions?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No high-risk intervention tickets active.</p>
              ) : (
                <div className="space-y-3">
                  {atRiskData.highRiskInterventions?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div>
                        <p className="text-sm font-bold text-white">
                          {item.beneficiaryId?.userId?.name || 'Beneficiary'}
                        </p>
                        <p className="text-xs text-slate-400">{item.reason}</p>
                      </div>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;
