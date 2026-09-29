import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedCounter from '../components/AnimatedCounter';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import { LayoutDashboard, Users, GraduationCap, CheckCircle2, AlertTriangle, BarChart3, Filter, ShieldAlert, Video } from 'lucide-react';
import { OfficerMascot } from '../components/Mascots';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import toast from 'react-hot-toast';

/*
  BACKGROUND & TEXT COLOR CONTRACT DECLARATION:
  - Page Background: var(--color-bg) [#FFF8F0 light / #14141F dark]
  - Card Surface: var(--color-surface) [#FFFFFF light / #1E1E2E dark]
  - Primary Text (Headings): var(--color-text-primary) [#1A1A2E light / #FAFAFA dark]
  - Secondary Text (Body/Labels): var(--color-text-secondary) [#4A4A5E light / #C4C4D4 dark]
  - Muted Text (Placeholders): var(--color-text-muted) [#8B8B9E both]
  - Primary Accent Button: var(--color-accent-primary) [#E85D2E light / #FF8B5E dark]
  - Secondary Accent: var(--color-accent-secondary) [#0F766E light / #2DD4BF dark]
  - Border Color: var(--color-border) [#E8E2D9 light / #2E2E42 dark]
*/

const OfficerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [skillDemand, setSkillDemand] = useState([]);
  const [atRiskData, setAtRiskData] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [videoCallRequests, setVideoCallRequests] = useState([]);
  const [handlingCallRequest, setHandlingCallRequest] = useState('');
  const [completionCandidates, setCompletionCandidates] = useState([]);
  const [opportunityApplications, setOpportunityApplications] = useState([]);
  const [applicationStatusDrafts, setApplicationStatusDrafts] = useState({});
  const [incompleteProfiles, setIncompleteProfiles] = useState([]);
  const [correctionSelections, setCorrectionSelections] = useState({});
  const [correctionReasons, setCorrectionReasons] = useState({});
  const [pathwayReviewQueue, setPathwayReviewQueue] = useState([]);
  const [reviewFeedback, setReviewFeedback] = useState({});
  const [intelligence, setIntelligence] = useState(null);
  const [supportSeats, setSupportSeats] = useState('100');
  const [policyProjection, setPolicyProjection] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('');

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

      const [sumRes, demandRes, riskRes, approvalRes, workflowRes, intelligenceRes, completionRes, applicationsRes, incompleteRes, videoCallsRes] = await Promise.all([
        client.get(`/admin/dashboard/summary${districtQuery}`),
        client.get('/admin/dashboard/skill-demand'),
        client.get('/admin/dashboard/at-risk'),
        client.get('/certificates/pending'),
        client.get('/workflow/review-queue'),
        client.get('/admin/dashboard/intelligence'),
        client.get('/enrollments?status=IN_PROGRESS'),
        client.get('/applications'),
        client.get('/beneficiaries/profiles/incomplete'),
        client.get('/video-calls/pending'),
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.data);
      if (demandRes.data.success) setSkillDemand(demandRes.data.data || []);
      if (riskRes.data.success) setAtRiskData(riskRes.data.data);
      if (approvalRes.data.success) setPendingApprovals(approvalRes.data.data || []);
      if (workflowRes.data.success) setPathwayReviewQueue(workflowRes.data.data || []);
      if (intelligenceRes.data.success) setIntelligence(intelligenceRes.data.data);
      if (completionRes.data.success) setCompletionCandidates(completionRes.data.data || []);
      if (applicationsRes.data.success) setOpportunityApplications(applicationsRes.data.data || []);
      if (incompleteRes.data.success) setIncompleteProfiles(incompleteRes.data.data || []);
      if (videoCallsRes.data.success) setVideoCallRequests(videoCallsRes.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateApproval = async (enrollmentId, stage) => {
    try {
      await client.post(`/certificates/${enrollmentId}/approve`, { stage });
      toast.success(`${stage === 'ENROLLMENT' ? 'Enrollment' : 'Completion'} certificate approved and emailed.`);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve certificate');
    }
  };

  const acceptVideoCall = async (callRequest) => {
    setHandlingCallRequest(String(callRequest._id));
    try {
      await client.patch(`/video-calls/${callRequest._id}/accept`);
      setVideoCallRequests((requests) => requests.filter((request) => request._id !== callRequest._id));
      navigate(`/video-call?requestId=${encodeURIComponent(callRequest._id)}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to accept this call request.');
      fetchDashboardData();
    } finally {
      setHandlingCallRequest('');
    }
  };

  const declineVideoCall = async (callRequest) => {
    setHandlingCallRequest(String(callRequest._id));
    try {
      await client.patch(`/video-calls/${callRequest._id}/decline`, {});
      setVideoCallRequests((requests) => requests.filter((request) => request._id !== callRequest._id));
      toast.success('Call request declined.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to decline this call request.');
      fetchDashboardData();
    } finally {
      setHandlingCallRequest('');
    }
  };

  useEffect(() => {
    const refreshCallQueue = async () => {
      try {
        const response = await client.get('/video-calls/pending');
        if (response.data.success) setVideoCallRequests(response.data.data || []);
      } catch {
        // The initial dashboard load reports request failures to the user.
      }
    };
    const interval = window.setInterval(refreshCallQueue, 15000);
    return () => window.clearInterval(interval);
  }, []);

  const handlePathwayReview = async (twinId, decision) => {
    const feedback = reviewFeedback[twinId] || '';
    if (decision === 'REJECTED' && !feedback.trim()) {
      toast.error('Add feedback before rejecting this pathway.');
      return;
    }
    try {
      await client.patch(`/workflow/${twinId}/review`, { decision, feedback });
      toast.success(decision === 'APPROVED' ? 'Pathway approved.' : 'Pathway rejected with feedback.');
      setPathwayReviewQueue((queue) => queue.filter((item) => item._id !== twinId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to record pathway review.');
    }
  };

  const handleTrainingCompletion = async (enrollmentId) => {
    try {
      await client.patch(`/enrollments/${enrollmentId}/complete`, {
        completionConfirmed: true,
        notes: 'Completion confirmed by officer from the training review queue.',
      });
      toast.success('Training completion verified. Its completion certificate is now in the approval queue.');
      await fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to verify training completion.');
    }
  };

  const updateApplicationStatus = async (application) => {
    const status = applicationStatusDrafts[application._id] || application.status;
    if (status === application.status) return;
    try {
      const response = await client.patch(`/applications/${application._id}/status`, {
        status,
        note: `Status updated by ${user?.name || 'officer'}`,
      });
      setOpportunityApplications((current) => current.map((item) => item._id === application._id ? response.data.data : item));
      toast.success('Application status updated.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update application.');
    }
  };

  const requestProfileCorrections = async (profile) => {
    const fields = correctionSelections[profile._id] || [];
    const reason = correctionReasons[profile._id] || '';
    if (!fields.length || !reason.trim()) {
      toast.error('Select fields and provide a correction reason.');
      return;
    }
    try {
      await client.post(`/beneficiaries/profile/${profile._id}/correction-requests`, { fields, reason });
      setIncompleteProfiles((profiles) => profiles.filter((item) => item._id !== profile._id));
      toast.success('Correction request sent to the beneficiary.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to request profile corrections.');
    }
  };

  const handlePolicySimulation = async (event) => {
    event.preventDefault();
    try {
      const response = await client.post('/admin/dashboard/policy-simulate', { supportSeats: Number(supportSeats) });
      setPolicyProjection(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to run policy simulation.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-[var(--color-bg)] min-h-screen">
        <DashboardSkeleton />
      </div>
    );
  }

  // Locked color palette array for Recharts bars
  const BAR_COLORS = ['#E85D2E', '#0F766E', '#FF8B5E', '#2DD4BF', '#4A4A5E', '#1A1A2E'];

  return (
    <div className="bg-[var(--color-bg)] min-h-screen pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Dashboard Top Header with OfficerMascot */}
        <div className="bg-[var(--color-surface)] rounded-3xl p-8 border border-[var(--color-border)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent-primary)] shrink-0">
              <LayoutDashboard className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{t('officerTitle')}</h1>
                <span className="px-2.5 py-0.5 rounded-full badge-secondary text-xs font-bold">
                  {user?.role}
                </span>
              </div>
              <p className="text-[var(--color-text-secondary)] text-sm mt-1">{t('officerSub')}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <OfficerMascot className="w-24 h-24 hidden sm:block drop-shadow-md shrink-0" />
            
            {/* District Filter Selector */}
            <div className="flex items-center space-x-3 bg-[var(--color-bg)] p-3 rounded-2xl border border-[var(--color-border)] shadow-md">
              <Filter className="w-4 h-4 text-[var(--color-accent-primary)] shrink-0 ml-1" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-transparent text-sm font-bold text-[var(--color-text-primary)] outline-none pr-4 cursor-pointer"
              >
                <option value="" className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">All Districts</option>
                <option value="Bhopal" className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">Bhopal</option>
                <option value="Indore" className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">Indore</option>
                <option value="Ujjain" className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">Ujjain</option>
                <option value="Gwalior" className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">Gwalior</option>
              </select>
            </div>
          </div>
        </div>

        {/* STAT CARDS (CountUp Animated) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: t('totalBeneficiaries'),
              val: summary?.totalBeneficiaries || 0,
              icon: Users,
              color: 'text-[var(--color-accent-primary)]',
            },
            {
              title: t('activeEnrollments'),
              val: summary?.activeEnrollments || 0,
              icon: GraduationCap,
              color: 'text-[var(--color-accent-secondary)]',
            },
            {
              title: t('completedTrainings'),
              val: summary?.completedTrainings || 0,
              icon: CheckCircle2,
              color: 'text-[var(--color-accent-secondary)]',
            },
            {
              title: t('openInterventions'),
              val: summary?.openInterventions || 0,
              icon: AlertTriangle,
              color: 'text-[var(--color-accent-primary)]',
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-[var(--color-surface)] rounded-3xl p-6 border border-[var(--color-border)] shadow-md flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">{stat.title}</p>
                  <div className={`text-3xl font-black ${stat.color}`}>
                    <AnimatedCounter start={0} end={stat.val} duration={1.5} />
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-[var(--color-border)] bg-[var(--color-bg)]">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* RECHARTS SKILL DEMAND BAR CHART */}
        <div className="bg-[var(--color-surface)] rounded-3xl p-8 border border-[var(--color-border)] shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent-primary)]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[var(--color-text-primary)]">{t('skillDemandTitle')}</h2>
                <p className="text-xs text-[var(--color-text-secondary)]">Training enrollment distribution grouped by NSQF sector (Recharts)</p>
              </div>
            </div>
          </div>

          {skillDemand.length === 0 ? (
            <div className="text-center py-10 text-[var(--color-text-muted)] text-sm italic">
              No sector enrollment data currently available.
            </div>
          ) : (
            <div className="w-full h-80 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillDemand} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.7} />
                  <XAxis 
                    dataKey="sector" 
                    stroke="var(--color-text-secondary)" 
                    fontSize={12}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)' }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                  />
                  <Bar dataKey="enrollmentCount" name="Enrollments" radius={[8, 8, 0, 0]}>
                    {skillDemand.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {intelligence && (
          <section className="bg-[var(--color-surface)] rounded-3xl p-8 border border-[var(--color-border)] shadow-xl space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--color-border)] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Community and government intelligence</p>
                <h2 className="text-xl font-black text-[var(--color-text-primary)]">District perspective plan</h2>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">Based on saved enrollment, center, profile, and verified outcome records</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {intelligence.skillHeatmap.byDistrict.slice(0, 4).map((district) => (
                <div key={district.district} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                  <p className="text-xs font-bold text-[var(--color-text-secondary)]">{district.district}</p>
                  <p className="mt-1 text-2xl font-black text-[var(--color-accent-primary)]">{district.beneficiaries}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">registered beneficiaries</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase text-[var(--color-text-secondary)]">
                  <tr><th className="py-2 pr-4">Sector</th><th className="px-3 py-2">Enrollments</th><th className="px-3 py-2">Seats</th><th className="px-3 py-2">Completions</th><th className="px-3 py-2">Dropouts</th><th className="px-3 py-2">Capacity gap</th></tr>
                </thead>
                <tbody>
                  {intelligence.perspectivePlan.slice(0, 8).map((row) => (
                    <tr key={row.sector} className="border-t border-[var(--color-border)] text-[var(--color-text-primary)]">
                      <td className="py-3 pr-4 font-bold">{row.sector}</td><td className="px-3 py-3">{row.enrollments}</td><td className="px-3 py-3">{row.seatCapacity}</td><td className="px-3 py-3">{row.completions}</td><td className="px-3 py-3">{row.dropouts}</td><td className="px-3 py-3">{row.capacityGap}</td>
                    </tr>
                  ))}
                  {intelligence.perspectivePlan.length === 0 && <tr><td className="py-3 text-[var(--color-text-muted)]" colSpan="6">No sector activity recorded yet.</td></tr>}
                </tbody>
              </table>
            </div>
            <form onSubmit={handlePolicySimulation} className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:items-end">
              <label className="block max-w-xs flex-1">
                <span className="mb-1 block text-xs font-bold text-[var(--color-text-secondary)]">Additional training seats to simulate</span>
                <input type="number" min="0" max="100000" value={supportSeats} onChange={(event) => setSupportSeats(event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text-primary)]" />
              </label>
              <button type="submit" className="rounded-xl bg-[var(--color-accent-primary)] px-4 py-2.5 text-sm font-bold text-white">Run policy scenario</button>
              {policyProjection && (
                <p className="text-sm text-[var(--color-text-secondary)] sm:ml-auto">
                  Estimate: {policyProjection.projection.estimatedCompletions} completions, {policyProjection.projection.estimatedDropouts} dropouts. {policyProjection.note}
                </p>
              )}
            </form>
          </section>
        )}

        {/* AT-RISK BENEFICIARIES & INTERVENTIONS SECTION */}
        {atRiskData && (
          <div className="bg-[var(--color-surface)] rounded-3xl p-8 border border-[var(--color-border)] shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-6 h-6 text-[var(--color-accent-primary)]" />
                <h2 className="text-xl font-black text-[var(--color-text-primary)]">{t('atRiskTitle')}</h2>
              </div>
              <span className="px-3 py-1 rounded-full badge-secondary text-xs font-bold">
                {atRiskData.totalAtRiskCount || 0} Flagged
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Low Attendance List */}
              <div className="bg-[var(--color-bg)] rounded-2xl p-5 border border-[var(--color-border)] space-y-4">
                <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Low Attendance (&lt; 50%)</h3>
                {atRiskData.lowAttendanceEnrollments?.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)] italic">No low-attendance alerts.</p>
                ) : (
                  <div className="space-y-3">
                    {atRiskData.lowAttendanceEnrollments?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)]">
                        <div>
                          <p className="text-sm font-bold text-[var(--color-text-primary)]">
                            {item.enrollmentId?.beneficiaryId?.userId?.name || 'Beneficiary'}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)]">{item.enrollmentId?.courseId?.courseName}</p>
                        </div>
                        <span className="text-xs font-black text-[var(--color-accent-primary)] bg-[var(--color-bg)] px-2.5 py-1 rounded-lg border border-[var(--color-border)]">
                          {item.attendancePercentage}% Att.
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* High Risk Interventions */}
              <div className="bg-[var(--color-bg)] rounded-2xl p-5 border border-[var(--color-border)] space-y-4">
                <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">High Risk Interventions</h3>
                {atRiskData.highRiskInterventions?.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)] italic">No high-risk intervention tickets active.</p>
                ) : (
                  <div className="space-y-3">
                    {atRiskData.highRiskInterventions?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)]">
                        <div>
                          <p className="text-sm font-bold text-[var(--color-text-primary)]">
                            {item.beneficiaryId?.userId?.name || 'Beneficiary'}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)]">{item.reason}</p>
                        </div>
                        <span className="text-xs font-bold text-[var(--color-accent-secondary)] bg-[var(--color-bg)] px-2 py-1 rounded-lg border border-[var(--color-border)]">
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

        {pathwayReviewQueue.length > 0 && (
          <section className="bg-[var(--color-surface)] rounded-3xl p-8 border border-[var(--color-border)] shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Skill and pathway intelligence</p>
                <h2 className="text-xl font-black text-[var(--color-text-primary)]">Officer review</h2>
              </div>
              <span className="px-3 py-1 rounded-full badge-secondary text-xs font-bold">{pathwayReviewQueue.length} pending</span>
            </div>
            <div className="space-y-4">
              {pathwayReviewQueue.map((twin) => (
                <article key={twin._id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 space-y-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-black text-[var(--color-text-primary)]">
                        {twin.beneficiaryId?.userId?.name || 'Voice or profile assessment'}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {[twin.beneficiaryId?.location?.district, twin.beneficiaryId?.location?.state].filter(Boolean).join(', ') || 'Location not recorded'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-bold text-[var(--color-accent-primary)]">{twin.source} intake</span>
                      <span className="mt-1 block text-xs font-semibold text-[var(--color-text-secondary)]">
                        SC certificate: {twin.documentVerification?.scCertificateStatus || 'NOT_SUBMITTED'}
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ['Skill gaps', twin.skillGapEngine?.nsqf],
                      ['Training', twin.opportunityMatcher?.training],
                      ['Jobs / enterprise', [...(twin.opportunityMatcher?.jobs || []), ...(twin.opportunityMatcher?.enterprise || [])]],
                    ].map(([label, items]) => (
                      <div key={label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                        <p className="text-xs font-bold text-[var(--color-text-secondary)]">{label}</p>
                        <p className="mt-1 text-sm text-[var(--color-text-primary)]">
                          {Array.isArray(items) && items.length
                            ? items.slice(0, 3).map((item) => item.details?.courseName || item.details?.title || item.name || item).join(', ')
                            : 'No matching items'}
                        </p>
                      </div>
                    ))}
                  </div>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-[var(--color-text-secondary)]">Review feedback</span>
                    <textarea
                      value={reviewFeedback[twin._id] || ''}
                      onChange={(event) => setReviewFeedback((current) => ({ ...current, [twin._id]: event.target.value }))}
                      rows={2}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]"
                      placeholder="Required when rejecting; optional for approval"
                    />
                  </label>
                  <div className="flex flex-wrap justify-end gap-3">
                    <button type="button" onClick={() => handlePathwayReview(twin._id, 'REJECTED')} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50">
                      Reject with feedback
                    </button>
                    <button type="button" onClick={() => handlePathwayReview(twin._id, 'APPROVED')} className="rounded-xl bg-[var(--color-accent-secondary)] px-4 py-2 text-sm font-bold text-white hover:opacity-90">
                      Approve pathway
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {completionCandidates.length > 0 && (
          <section className="bg-[var(--color-surface)] rounded-3xl p-8 border border-[var(--color-border)] shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Training progress</p>
                <h2 className="text-xl font-black text-[var(--color-text-primary)]">Completion review</h2>
              </div>
              <span className="px-3 py-1 rounded-full badge-secondary text-xs font-bold">{completionCandidates.length} in progress</span>
            </div>
            <div className="space-y-3">
              {completionCandidates.map((enrollment) => (
                <div key={enrollment._id} className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-[var(--color-text-primary)]">{enrollment.beneficiaryId?.userId?.name || 'Beneficiary'}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{enrollment.courseId?.courseName || 'Training course'} · {enrollment.centerId?.name || 'Training centre'}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">Attendance: {enrollment.progress?.attendancePercentage ?? 0}%</p>
                  </div>
                  <button type="button" onClick={() => handleTrainingCompletion(enrollment._id)} className="rounded-xl bg-[var(--color-accent-secondary)] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90">
                    Confirm completion
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {incompleteProfiles.length > 0 && (
          <section className="bg-[var(--color-surface)] rounded-3xl p-8 border border-[var(--color-border)] shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Beneficiary profile quality</p>
                <h2 className="text-xl font-black text-[var(--color-text-primary)]">Incomplete verified profiles</h2>
              </div>
              <span className="px-3 py-1 rounded-full badge-secondary text-xs font-bold">{incompleteProfiles.length} profiles</span>
            </div>
            <div className="space-y-4">
              {incompleteProfiles.slice(0, 8).map((profile) => {
                const selected = correctionSelections[profile._id] || [];
                return (
                  <article key={profile._id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-[var(--color-text-primary)]">{profile.userId?.name || 'Beneficiary'}</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">{profile.location?.district || 'District missing'} · {profile.profileCompletion || 0}% complete</p>
                      </div>
                      <span className="text-xs font-bold text-[var(--color-text-muted)]">Missing: {profile.missingFields?.map((field) => field.label).join(', ') || 'No required fields'}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {(profile.missingFields || []).map((field) => (
                        <label key={field.field} className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-text-secondary)]">
                          <input
                            type="checkbox"
                            checked={selected.includes(field.field)}
                            onChange={(event) => setCorrectionSelections((current) => ({
                              ...current,
                              [profile._id]: event.target.checked
                                ? [...selected, field.field]
                                : selected.filter((item) => item !== field.field),
                            }))}
                            className="accent-emerald-600"
                          />
                          {field.label}
                        </label>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input value={correctionReasons[profile._id] || ''} onChange={(event) => setCorrectionReasons((current) => ({ ...current, [profile._id]: event.target.value }))} placeholder="Explain what needs correcting" className="app-input min-w-0 flex-1 rounded-xl px-3 py-2 text-sm" />
                      <button type="button" onClick={() => requestProfileCorrections(profile)} className="rounded-xl bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-bold text-white">Request corrections</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {opportunityApplications.length > 0 && (
          <section className="bg-[var(--color-surface)] rounded-3xl p-8 border border-[var(--color-border)] shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Employment and enterprise matching</p>
                <h2 className="text-xl font-black text-[var(--color-text-primary)]">Opportunity applications</h2>
              </div>
              <span className="px-3 py-1 rounded-full badge-secondary text-xs font-bold">{opportunityApplications.length} tracked</span>
            </div>
            <div className="space-y-3">
              {opportunityApplications.slice(0, 12).map((application) => (
                <article key={application._id} className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="font-black text-[var(--color-text-primary)]">{application.beneficiaryId?.userId?.name || 'Beneficiary'}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{application.opportunityId?.title || 'Opportunity'} · {application.opportunityId?.sector || 'Local livelihood'}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">Applied {new Date(application.createdAt).toLocaleDateString()} · {application.history?.length || 1} status events</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-[var(--color-accent-secondary)]">{application.status}</span>
                    <select
                      aria-label={`Update application status for ${application.beneficiaryId?.userId?.name || 'beneficiary'}`}
                      value={applicationStatusDrafts[application._id] || application.status}
                      onChange={(event) => setApplicationStatusDrafts((current) => ({ ...current, [application._id]: event.target.value }))}
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2 text-xs text-[var(--color-text-primary)]"
                    >
                      {['INTERESTED', 'APPLIED', 'INTERVIEW', 'OFFERED', 'REJECTED', 'WITHDRAWN', 'HIRED'].map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <button type="button" onClick={() => updateApplicationStatus(application)} disabled={(applicationStatusDrafts[application._id] || application.status) === application.status} className="rounded-lg bg-[var(--color-accent-primary)] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Update</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {videoCallRequests.length > 0 && (
          <section className="space-y-5 border-y border-[var(--color-border)] py-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent-secondary)]">
                  <Video className="h-4 w-4" /> Live support
                </p>
                <h2 className="mt-1 text-xl font-black text-[var(--color-text-primary)]">Video call requests</h2>
              </div>
              <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-bold text-[var(--color-text-secondary)]">
                {videoCallRequests.length} waiting
              </span>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {videoCallRequests.map((request) => {
                const beneficiaryName = request.beneficiaryId?.userId?.name || 'Beneficiary';
                const isHandling = handlingCallRequest === String(request._id);
                return (
                  <article key={request._id} className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-[var(--color-text-primary)]">{beneficiaryName}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">{request.beneficiaryId?.location?.district || request.beneficiaryId?.location?.state || 'Location not provided'}</p>
                      {request.topic && <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-secondary)]">{request.topic}</p>}
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">Requested {new Date(request.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button type="button" onClick={() => declineVideoCall(request)} disabled={isHandling} className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-bold text-[var(--color-text-secondary)] hover:text-rose-700 disabled:opacity-50">
                        Decline
                      </button>
                      <button type="button" onClick={() => acceptVideoCall(request)} disabled={isHandling} className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent-secondary)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                        <Video className="h-4 w-4" /> {isHandling ? 'Opening...' : 'Accept & join'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {pendingApprovals.length > 0 && (
          <div className="bg-[var(--color-surface)] rounded-3xl p-8 border border-[var(--color-border)] shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Certificate approvals</p>
                <h2 className="text-xl font-black text-[var(--color-text-primary)]">Pending approval queue</h2>
              </div>
              <span className="px-3 py-1 rounded-full badge-secondary text-xs font-bold">
                {pendingApprovals.length} pending
              </span>
            </div>

            <div className="space-y-4">
              {pendingApprovals.map((item) => (
                <div key={item.enrollmentId} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-black text-[var(--color-text-primary)]">{item.beneficiaryName}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">{item.courseName} • {item.centerName}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">Status: {item.status}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {item.needsEnrollmentCertificate && (
                        <button
                          type="button"
                          onClick={() => handleCertificateApproval(item.enrollmentId, 'ENROLLMENT')}
                          className="rounded-xl bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-bold text-white shadow-md transition hover:opacity-90"
                        >
                          Approve enrollment certificate
                        </button>
                      )}

                      {item.needsCompletionCertificate && (
                        <button
                          type="button"
                          onClick={() => handleCertificateApproval(item.enrollmentId, 'COMPLETION')}
                          className="rounded-xl bg-[var(--color-accent-secondary)] px-4 py-2 text-sm font-bold text-white shadow-md transition hover:opacity-90"
                        >
                          Approve completion certificate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
