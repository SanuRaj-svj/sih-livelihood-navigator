import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import client from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { CardSkeleton } from '../components/SkeletonLoader';
import { Map, BookOpen, Building2, CheckCircle2, Clock, Sparkles, Trophy, IndianRupee, Briefcase, ArrowUpRight, ShieldCheck, Lightbulb, Landmark, Store, Target } from 'lucide-react';
import { JourneyMascot, EmptyStateMascot } from '../components/Mascots';
import toast from 'react-hot-toast';

/*
  BACKGROUND & TEXT COLOR CONTRACT DECLARATION:
  - Page Background: var(--color-bg) [#FFF8F0 light / #14141F dark]
  - Card Surface: var(--color-surface) [#FFFFFF light / #1E1E2E dark]
  - Primary Text (Headings): var(--color-text-primary) [#1A1A2E light / #FAFAFA dark]
  - Secondary Text (Body/Labels): var(--color-text-secondary) [#4A4A5E light / #C4C4D4 dark]
  - Muted Text (Placeholders): var(--color-text-muted) [#8B8B9E both]
  - Primary Accent Button: var(--color-accent-primary) [#E85D2E light / #FF8B5E dark]
  - Secondary Accent (Timeline/Badges): var(--color-accent-secondary) [#0F766E light / #2DD4BF dark]
  - Border Color: var(--color-border) [#E8E2D9 light / #2E2E42 dark]
*/

const Roadmap = () => {
  const { t } = useLanguage();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certificateId, setCertificateId] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [reportingDropout, setReportingDropout] = useState('');
  const [checkInForms, setCheckInForms] = useState({});
  const [savingCheckIn, setSavingCheckIn] = useState('');
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

  const unlockCourse = async () => {
    if (!certificateId.trim()) return;
    try {
      setUnlocking(true);
      await client.post('/certificates/unlock', { certificateId: certificateId.trim() });
      toast.success('Enrollment certificate verified. Course access unlocked.');
      setCertificateId('');
      await fetchMyEnrollments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Certificate verification failed');
    } finally {
      setUnlocking(false);
    }
  };

  const reportDropout = async (enrollmentId) => {
    try {
      setReportingDropout(enrollmentId);
      await client.patch(`/enrollments/${enrollmentId}/dropout`, { reason: 'Beneficiary requested support to continue training.' });
      toast.success('Your request was sent to an officer for follow-up.');
      await fetchMyEnrollments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to request follow-up.');
    } finally {
      setReportingDropout('');
    }
  };

  const updateCheckInForm = (enrollmentId, field, value) => {
    setCheckInForms((current) => ({
      ...current,
      [enrollmentId]: { ...(current[enrollmentId] || {}), [field]: value },
    }));
  };

  const submitTrainingCheckIn = async (event, enrollment) => {
    event.preventDefault();
    const values = checkInForms[enrollment._id] || {};
    const attendancePercentage = Number(values.attendancePercentage ?? enrollment.progress?.attendancePercentage ?? 0);
    if (!Number.isFinite(attendancePercentage) || attendancePercentage < 0 || attendancePercentage > 100) {
      toast.error('Enter attendance between 0 and 100.');
      return;
    }
    try {
      setSavingCheckIn(enrollment._id);
      await client.post(`/enrollments/${enrollment._id}/check-ins`, {
        attendancePercentage,
        currentModule: values.currentModule ?? enrollment.progress?.currentModule ?? '',
        notes: values.notes || '',
      });
      toast.success('Training check-in saved.');
      await fetchMyEnrollments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save training check-in.');
    } finally {
      setSavingCheckIn('');
    }
  };

  useEffect(() => {
    if (loading || enrollments.length === 0 || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray('.journey-line-fill').forEach((line) => {
        const targetWidth = line.getAttribute('data-progress') || '0%';
        gsap.fromTo(
          line,
          { width: '0%' },
          { width: targetWidth, duration: 1.2, ease: 'power2.out' }
        );
      });

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
    { key: 'TRAINING', label: 'Training', icon: BookOpen },
    { key: 'BUSINESS_IDEA', label: 'Business Idea', icon: Lightbulb },
    { key: 'GOVERNMENT_SCHEME', label: 'Government Scheme', icon: Landmark },
    { key: 'FUNDING', label: 'Funding', icon: IndianRupee },
    { key: 'MARKET', label: 'Market', icon: Store },
    { key: 'BUSINESS', label: 'Business', icon: Target },
  ];

  const getActiveStageIndex = (enrollment) => {
    const status = enrollment.status;
    const progress = enrollment.progress;
    const outcome = enrollment.outcome;

    if (outcome) return 5;
    if (status === 'COMPLETED') return 4;
    if (status === 'IN_PROGRESS' || (progress && progress.attendancePercentage > 0)) return 3;
    if (status === 'ENROLLED') return 1;
    return 0;
  };

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[var(--color-bg)]">
      {/* Header Banner with JourneyMascot */}
      <div className="bg-[var(--color-surface)] rounded-3xl p-8 border border-[var(--color-border)] shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent-primary)] shrink-0">
            <Map className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{t('journeyTitle')}</h1>
            <p className="text-[var(--color-text-secondary)] font-medium text-sm mt-1">
              {t('journeySub')}
            </p>
          </div>
        </div>

        <JourneyMascot className="w-36 h-36 hidden sm:block drop-shadow-xs shrink-0" />
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-16 bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] shadow-md flex flex-col items-center justify-center">
          <EmptyStateMascot className="w-36 h-36 mb-2" />
          <h3 className="text-xl font-black text-[var(--color-text-primary)]">{t('noEnrollmentsYet')}</h3>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium max-w-md mx-auto mt-2 mb-6">
            {t('noEnrollmentsSub')}
          </p>
          <a
            href="/recommendations"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl btn-accent font-extrabold text-sm shadow-md btn-bouncy"
          >
            <span>{t('exploreRecsBtn')}</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {enrollments.some((enrollment) => !enrollment.enrollmentCertificateVerifiedAt) && (
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-md">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-[var(--color-accent-primary)]" />
                <div>
                  <h2 className="text-lg font-black text-[var(--color-text-primary)]">Verify your enrollment certificate</h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">Enter the certificate ID approved by an administrator to resume your course.</p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input value={certificateId} onChange={(event) => setCertificateId(event.target.value)} placeholder="CERT-..." className="app-input min-w-0 flex-1 rounded-xl px-4 py-3" />
                <button type="button" onClick={unlockCourse} disabled={unlocking} className="btn-accent rounded-xl px-5 py-3 font-bold disabled:opacity-60">
                  {unlocking ? 'Verifying...' : 'Verify & Resume'}
                </button>
              </div>
            </div>
          )}
          {enrollments.map((enrollment, index) => {
            const courseName = enrollment.courseId?.courseName || 'NSQF Training Course';
            const centerName = enrollment.centerId?.name || 'Regional Skill Center';
            const centerLocation = enrollment.centerId?.district || enrollment.centerId?.address || 'Madhya Pradesh';
            const activeStageIdx = getActiveStageIndex(enrollment);
            const progressPct = ((activeStageIdx) / (stages.length - 1)) * 100;
            const progress = enrollment.progress;
            const outcome = enrollment.outcome;
            const certificateTimeline = enrollment.certificateTimeline;

            return (
              <motion.div
                key={enrollment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-[var(--color-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] shadow-lg relative space-y-6"
              >
                {/* Course Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider badge-secondary">
                        {enrollment.status}
                      </span>
                      {enrollment.courseId?.sector && (
                        <span className="text-xs font-extrabold text-[var(--color-accent-primary)] bg-[var(--color-bg)] px-2.5 py-0.5 rounded-md border border-[var(--color-border)]">
                          {enrollment.courseId.sector}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-black text-[var(--color-text-primary)]">{courseName}</h2>
                    <p className="text-xs font-medium text-[var(--color-text-secondary)] mt-1 flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-[var(--color-accent-secondary)] inline" />
                      <span>{centerName} • {centerLocation}</span>
                    </p>
                  </div>

                  {/* Attendance Pill */}
                  {progress && (
                    <div className="bg-[var(--color-bg)] rounded-2xl p-4 border border-[var(--color-border)] text-right min-w-[140px]">
                      <span className="text-[11px] font-extrabold text-[var(--color-text-secondary)] uppercase tracking-wider block">{t('attendanceLabel')}</span>
                      <span className="text-2xl font-black text-[var(--color-accent-secondary)]">
                        {progress.attendancePercentage}%
                      </span>
                    </div>
                  )}
                </div>

                <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-black text-[var(--color-text-primary)]">Training certificate status</h3>
                    {certificateTimeline?.notificationStatus === 'SENT' && <span className="text-[10px] font-bold text-emerald-700">Email sent</span>}
                  </div>
                  <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        label: 'Enrollment approval',
                        status: certificateTimeline?.enrollmentApproval === 'APPROVED' ? 'Approved' : 'Awaiting officer review',
                        done: certificateTimeline?.enrollmentApproval === 'APPROVED',
                      },
                      {
                        label: 'Training',
                        status: enrollment.status === 'COMPLETED' ? 'Completed' : enrollment.enrollmentCertificateVerifiedAt ? 'In progress' : 'Starts after certificate unlock',
                        done: enrollment.status === 'COMPLETED',
                      },
                      {
                        label: 'Completion review',
                        status: certificateTimeline?.completionReview === 'APPROVED' ? 'Approved' : certificateTimeline?.completionReview === 'AWAITING_OFFICER_REVIEW' ? 'Awaiting officer review' : 'Not ready',
                        done: certificateTimeline?.completionReview === 'APPROVED',
                      },
                      {
                        label: 'Completion certificate',
                        status: certificateTimeline?.completionCertificateId ? 'Ready to download' : 'Not issued yet',
                        done: Boolean(certificateTimeline?.completionCertificateId),
                      },
                    ].map((stage) => (
                      <li key={stage.label} className={`rounded-xl border p-3 ${stage.done ? 'border-emerald-300 bg-emerald-50' : 'border-[var(--color-border)] bg-[var(--color-surface)]'}`}>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)]">{stage.label}</p>
                        <p className={`mt-1 text-xs font-black ${stage.done ? 'text-emerald-800' : 'text-[var(--color-text-primary)]'}`}>{stage.status}</p>
                      </li>
                    ))}
                  </ol>
                </section>

                {enrollment.completionCertificateId && (
                  <div className="flex flex-col gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">Completion certificate issued</p>
                      <p className="mt-1 text-sm font-bold text-emerald-950">{enrollment.completionCertificateId}</p>
                      <p className="mt-1 text-xs text-emerald-800">
                        {certificateTimeline?.notificationStatus === 'SENT'
                          ? `Email sent ${certificateTimeline.beneficiaryNotifiedAt ? new Date(certificateTimeline.beneficiaryNotifiedAt).toLocaleString() : ''}`
                          : 'PDF is ready here; email delivery is not confirmed.'}
                      </p>
                    </div>
                    <a
                      href={`/api/certificates/download/${encodeURIComponent(enrollment.completionCertificateId)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
                    >
                      <ShieldCheck className="h-4 w-4" /> Download completion certificate
                    </a>
                  </div>
                )}

                {/* VISUAL JOURNEY TIMELINE */}
                <div className="py-4">
                  <div className="mb-6 flex flex-wrap items-center gap-2">
                    <p className="text-xs font-extrabold text-[var(--color-text-secondary)] uppercase tracking-wider">{t('visualTimeline')}</p>
                    <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--color-accent-primary)]">
                      Training → Business Idea → Government Scheme → Funding → Market → Business
                    </span>
                  </div>

                  <div className="relative">
                    {/* Background track line */}
                    <div className="absolute top-5 left-6 right-6 h-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full" />

                    {/* Animated GSAP fill line */}
                    <div
                      className="journey-line-fill absolute top-5 left-6 h-1.5 bg-[var(--color-accent-primary)] rounded-full"
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
                                  ? 'btn-accent border-[var(--color-accent-primary)] shadow-md'
                                  : isPast
                                  ? 'badge-secondary'
                                  : 'bg-[var(--color-bg)] text-[var(--color-text-muted)] border-[var(--color-border)]'
                              }`}
                            >
                              <StageIcon className="w-5 h-5 stroke-[2.2]" />
                              {isCurrent && (
                                <div className="stage-active-pulse absolute w-10 h-10 rounded-2xl bg-[var(--color-accent-primary)]/20 border border-[var(--color-accent-primary)] pointer-events-none" />
                              )}
                            </div>
                            <span
                              className={`text-xs font-extrabold mt-3 transition-colors ${
                                isCurrent
                                  ? 'text-[var(--color-accent-primary)]'
                                  : isPast
                                  ? 'text-[var(--color-accent-secondary)]'
                                  : 'text-[var(--color-text-muted)]'
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--color-border)]">
                  {/* Current Module & Progress Info */}
                  <div className="bg-[var(--color-bg)] rounded-2xl p-5 border border-[var(--color-border)] space-y-2">
                    <p className="text-xs font-extrabold text-[var(--color-text-secondary)] uppercase tracking-wider">{t('currentModule')}</p>
                    <p className="text-base font-black text-[var(--color-text-primary)]">
                      {progress?.currentModule || 'Orientation & Basics'}
                    </p>
                    {progress?.notes && (
                      <p className="text-xs text-[var(--color-text-secondary)] italic">"{progress.notes}"</p>
                    )}
                  </div>

                  {/* Employment Outcome Card (If exists) */}
                  {outcome ? (
                    <div className="bg-[var(--color-bg)] rounded-2xl p-5 border border-[var(--color-accent-secondary)] space-y-2 relative overflow-hidden">
                      <div className="flex items-center space-x-2 text-[var(--color-accent-secondary)] font-extrabold text-xs uppercase tracking-wider">
                        <Trophy className="w-4 h-4 text-[var(--color-accent-secondary)]" />
                        <span>{t('verifiedOutcome')}</span>
                      </div>
                      <p className="text-lg font-black text-[var(--color-text-primary)]">
                        {outcome.outcomeType?.replace('_', ' ')}: {outcome.employerOrBusinessName || 'Local Enterprise'}
                      </p>
                      <p className="text-sm font-black text-[var(--color-accent-secondary)] flex items-center space-x-1">
                        <IndianRupee className="w-4 h-4" />
                        <span>₹{outcome.monthlyIncome?.toLocaleString()} / month</span>
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[var(--color-bg)] rounded-2xl p-5 border border-[var(--color-border)] flex items-center space-x-3 text-[var(--color-text-secondary)]">
                      <Briefcase className="w-5 h-5 text-[var(--color-accent-primary)] shrink-0" />
                      <p className="text-xs font-medium">
                        {t('outcomePendingNote')}
                      </p>
                    </div>
                  )}
                </div>

                {['ENROLLED', 'IN_PROGRESS'].includes(enrollment.status) && (
                  <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 space-y-4">
                    <div>
                      <h3 className="text-sm font-black text-[var(--color-text-primary)]">Training check-in</h3>
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Record your latest attendance and learning progress.</p>
                      {enrollment.nextCheckInAt && <p className="mt-1 text-xs font-bold text-[var(--color-accent-secondary)]">Next check-in due {new Date(enrollment.nextCheckInAt).toLocaleDateString()}. Reminder email is scheduled 2 days before.</p>}
                    </div>
                    {!enrollment.enrollmentCertificateVerifiedAt ? (
                      <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-semibold text-amber-800">Verify your enrollment certificate above to submit check-ins.</p>
                    ) : (
                      <form onSubmit={(event) => submitTrainingCheckIn(event, enrollment)} className="grid gap-3 sm:grid-cols-2">
                        <label className="text-xs font-bold text-[var(--color-text-secondary)]">
                          Attendance percentage
                          <input type="number" min="0" max="100" required value={checkInForms[enrollment._id]?.attendancePercentage ?? enrollment.progress?.attendancePercentage ?? 0} onChange={(event) => updateCheckInForm(enrollment._id, 'attendancePercentage', event.target.value)} className="app-input mt-1 w-full rounded-xl px-3 py-2 text-sm" />
                        </label>
                        <label className="text-xs font-bold text-[var(--color-text-secondary)]">
                          Current module
                          <input type="text" maxLength="160" value={checkInForms[enrollment._id]?.currentModule ?? enrollment.progress?.currentModule ?? ''} onChange={(event) => updateCheckInForm(enrollment._id, 'currentModule', event.target.value)} placeholder="Module or milestone" className="app-input mt-1 w-full rounded-xl px-3 py-2 text-sm" />
                        </label>
                        <label className="text-xs font-bold text-[var(--color-text-secondary)] sm:col-span-2">
                          Notes
                          <textarea maxLength="1000" rows={2} value={checkInForms[enrollment._id]?.notes ?? ''} onChange={(event) => updateCheckInForm(enrollment._id, 'notes', event.target.value)} placeholder="Progress, questions, or support needed" className="app-input mt-1 w-full rounded-xl px-3 py-2 text-sm" />
                        </label>
                        <div className="flex items-center justify-between gap-3 sm:col-span-2">
                          <span className="text-xs text-[var(--color-text-muted)]">{progress?.checkIns?.length || 0} saved check-ins</span>
                          <button type="submit" disabled={savingCheckIn === enrollment._id} className="rounded-xl bg-[var(--color-accent-secondary)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                            {savingCheckIn === enrollment._id ? 'Saving...' : 'Save check-in'}
                          </button>
                        </div>
                      </form>
                    )}
                    {progress?.checkIns?.length > 0 && (
                      <div className="space-y-2 border-t border-[var(--color-border)] pt-3">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)]">Recent updates</p>
                        {progress.checkIns.slice(-3).reverse().map((checkIn, checkInIndex) => (
                          <div key={checkIn._id || `${checkIn.submittedAt}-${checkInIndex}`} className="flex flex-wrap justify-between gap-2 text-xs text-[var(--color-text-secondary)]">
                            <span><strong className="text-[var(--color-text-primary)]">{checkIn.attendancePercentage}%</strong> · {checkIn.currentModule || 'Progress update'}{checkIn.notes ? ` · ${checkIn.notes}` : ''}</span>
                            <time>{new Date(checkIn.submittedAt).toLocaleDateString()}</time>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {['ENROLLED', 'IN_PROGRESS'].includes(enrollment.status) && (
                  <div className="flex justify-end border-t border-[var(--color-border)] pt-4">
                    <button
                      type="button"
                      onClick={() => reportDropout(enrollment._id)}
                      disabled={reportingDropout === enrollment._id}
                      className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-bold text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] disabled:opacity-60"
                    >
                      {reportingDropout === enrollment._id ? 'Sending request...' : 'Report dropout and request support'}
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Roadmap;
