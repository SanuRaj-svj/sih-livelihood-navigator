import { useEffect, useRef, useState } from 'react';
import { Clock3, Copy, ExternalLink, PhoneOff, ShieldAlert, Users, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';

const JITSI_DOMAIN = 'meet.jit.si';
const JITSI_API_URL = `https://${JITSI_DOMAIN}/external_api.js`;
let jitsiApiPromise;

const loadJitsiApi = () => {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  if (jitsiApiPromise) return jitsiApiPromise;

  jitsiApiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = JITSI_API_URL;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => {
      jitsiApiPromise = null;
      reject(new Error('Could not load the video call service.'));
    };
    document.head.appendChild(script);
  });

  return jitsiApiPromise;
};

function VideoCall() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const conferenceRef = useRef(null);
  const requestId = new URLSearchParams(window.location.search).get('requestId');
  const [callRequest, setCallRequest] = useState(null);
  const [requestTopic, setRequestTopic] = useState('');
  const [requestLoading, setRequestLoading] = useState(true);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [activeRoom, setActiveRoom] = useState('');
  const [callStatus, setCallStatus] = useState('');
  const [callError, setCallError] = useState('');

  const refreshMyRequest = async () => {
    const response = await client.get('/video-calls/mine');
    setCallRequest(response.data.data || null);
    return response.data.data || null;
  };

  useEffect(() => {
    let cancelled = false;
    const loadRequest = async () => {
      setRequestLoading(true);
      try {
        if (requestId) {
          const response = await client.get(`/video-calls/${encodeURIComponent(requestId)}`);
          if (cancelled) return;
          const approvedRequest = response.data.data;
          setCallRequest(approvedRequest);
          if (approvedRequest.status !== 'ACCEPTED' || !approvedRequest.roomName) {
            setCallError('This call request has not been accepted.');
            return;
          }
          setActiveRoom(approvedRequest.roomName);
          setCallStatus('Connecting to the approved consultation...');
        } else if (user?.role === 'BENEFICIARY') {
          await refreshMyRequest();
        }
      } catch (error) {
        if (!cancelled) setCallError(error.response?.data?.message || 'Unable to load this call request.');
      } finally {
        if (!cancelled) setRequestLoading(false);
      }
    };

    loadRequest();
    return () => { cancelled = true; };
  }, [requestId, user?.role]);

  useEffect(() => {
    if (user?.role !== 'BENEFICIARY' || callRequest?.status !== 'PENDING') return undefined;
    const pollRequest = window.setInterval(() => {
      refreshMyRequest().catch(() => {});
    }, 5000);
    return () => window.clearInterval(pollRequest);
  }, [callRequest?.status, user?.role]);

  useEffect(() => {
    if (!activeRoom || !conferenceRef.current) return undefined;

    let cancelled = false;
    let conference;

    loadJitsiApi()
      .then(() => {
        if (cancelled) return;
        conference = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: activeRoom,
          parentNode: conferenceRef.current,
          width: '100%',
          height: '100%',
          userInfo: { displayName: user?.name || 'Livelihood participant' },
          configOverwrite: {
            prejoinPageEnabled: true,
            disableDeepLinking: true,
            startWithAudioMuted: true,
          },
        });
        conference.addEventListener('videoConferenceJoined', () => setCallStatus('You are in the call'));
        conference.addEventListener('videoConferenceLeft', () => setCallStatus('Call ended'));
        conference.addEventListener('readyToClose', () => {
          setActiveRoom('');
          setCallStatus('');
        });
      })
      .catch((error) => {
        if (!cancelled) {
          setCallError(error.message);
          setCallStatus('');
        }
      });

    return () => {
      cancelled = true;
      conference?.dispose();
    };
  }, [activeRoom, user?.name]);

  const requestCall = async (event) => {
    event.preventDefault();
    setRequestSubmitting(true);
    setCallError('');
    try {
      const response = await client.post('/video-calls', { topic: requestTopic });
      setCallRequest(response.data.data);
      setRequestTopic('');
      toast.success(response.data.alreadyRequested ? 'Your open call request is already in the queue.' : 'Call request sent to the support team.');
    } catch (error) {
      setCallError(error.response?.data?.message || 'Could not send your call request.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const joinApprovedCall = () => {
    if (!callRequest?._id) return;
    navigate(`/video-call?requestId=${encodeURIComponent(callRequest._id)}`);
  };

  const copyInviteLink = async () => {
    const inviteUrl = new URL('/video-call', window.location.origin);
    inviteUrl.searchParams.set('requestId', requestId || callRequest?._id || '');
    try {
      await navigator.clipboard.writeText(inviteUrl.toString());
      toast.success('Invite link copied');
    } catch {
      toast.error('Clipboard access is unavailable in this browser.');
    }
  };

  const leaveRoom = () => {
    setActiveRoom('');
    setCallStatus('');
    setCallError('');
    navigate('/video-call', { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-(--color-bg) px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-(--color-accent-secondary)">
              <Users className="h-4 w-4" /> Livelihood consultations
            </p>
            <h1 className="text-3xl font-black sm:text-4xl">Video call</h1>
            <p className="mt-2 max-w-2xl text-sm text-(--color-text-secondary)">
              Request a private consultation with a livelihood officer. The officer will accept before either side can join.
            </p>
          </div>
          {activeRoom && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-semibold text-(--color-text-secondary)">{callStatus}</span>
              <button type="button" onClick={copyInviteLink} title="Copy invite link" className="flex items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm font-bold hover:border-(--color-accent-primary)">
                <Copy className="h-4 w-4" /> Copy invite
              </button>
              <button type="button" onClick={leaveRoom} title="Leave call" className="flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-bold text-white hover:bg-rose-700">
                <PhoneOff className="h-4 w-4" /> Leave
              </button>
            </div>
          )}
        </header>

        {!activeRoom ? (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]">
            <section className="border-y border-(--color-border) py-7 lg:pr-10">
              <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-(--color-accent-primary) text-white">
                <Video className="h-6 w-6" />
              </div>
              {user?.role === 'BENEFICIARY' ? (
                <>
                  <h2 className="text-2xl font-extrabold">Request an officer call</h2>
                  {requestLoading ? (
                    <p className="mt-3 text-sm text-(--color-text-secondary)">Checking your call requests...</p>
                  ) : callRequest?.status === 'PENDING' ? (
                    <div className="mt-5 flex max-w-xl items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
                      <Clock3 className="mt-0.5 h-5 w-5 shrink-0" />
                      <div>
                        <p className="font-bold">Request sent. Waiting for an officer to accept.</p>
                        {callRequest.topic && <p className="mt-1 text-sm">{callRequest.topic}</p>}
                      </div>
                    </div>
                  ) : callRequest?.status === 'ACCEPTED' ? (
                    <div className="mt-5 flex max-w-xl flex-col items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-bold">An officer accepted your request.</p>
                        <p className="mt-1 text-xs">Join the call when you are ready.</p>
                      </div>
                      <button type="button" onClick={joinApprovedCall} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">
                        <Video className="h-4 w-4" /> Join call
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={requestCall} className="mt-3 max-w-xl">
                      {callRequest?.status === 'DECLINED' && (
                        <p className="mb-3 text-sm text-rose-700">
                          Your previous request was declined{callRequest.declineReason ? `: ${callRequest.declineReason}` : '.'}
                        </p>
                      )}
                      <label htmlFor="call-topic" className="mb-2 block text-sm font-bold">What would you like help with? <span className="font-normal text-(--color-text-muted)">(optional)</span></label>
                      <textarea id="call-topic" value={requestTopic} onChange={(event) => setRequestTopic(event.target.value)} maxLength={500} rows={3} className="app-input w-full rounded-lg p-3 text-sm" placeholder="For example, training options or a job application" />
                      <button type="submit" disabled={requestSubmitting || requestLoading} className="btn-accent mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-3 font-bold disabled:opacity-50">
                        <Video className="h-4 w-4" /> {requestSubmitting ? 'Sending request...' : 'Request a video call'}
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-extrabold">Calls require an accepted request</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-(--color-text-secondary)">
                    Accept a pending beneficiary call request from the officer dashboard to open its consultation room.
                  </p>
                  <button type="button" onClick={() => navigate('/officer-dashboard')} className="btn-accent mt-5 rounded-lg px-5 py-3 text-sm font-bold">
                    Open officer dashboard
                  </button>
                </>
              )}
              {callError && <p role="alert" className="mt-4 text-sm font-semibold text-rose-700">{callError}</p>}
            </section>

            <aside className="self-start border-l-2 border-(--color-accent-primary) py-2 pl-5">
              <h2 className="flex items-center gap-2 text-sm font-extrabold">
                <ShieldAlert className="h-4 w-4 text-(--color-accent-primary)" /> Call privacy
              </h2>
              <p className="mt-2 text-sm leading-6 text-(--color-text-secondary)">
                The room link is issued only after an officer accepts your request. Calls use the public Jitsi Meet service; avoid sharing sensitive personal or financial information.
              </p>
            </aside>
          </div>
        ) : (
          <section aria-label={`Video call room ${activeRoom}`} className="overflow-hidden rounded-xl border border-(--color-border) bg-[#10151d]">
            <div ref={conferenceRef} className="h-[min(72vh,760px)] min-h-105 w-full" />
            {callError && (
              <div role="alert" className="border-t border-white/10 p-5 text-sm text-white">
                <p>{callError}</p>
                <a href={`https://${JITSI_DOMAIN}/${encodeURIComponent(activeRoom)}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 font-bold text-teal-300 underline">
                  Open the room in a new tab <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default VideoCall;