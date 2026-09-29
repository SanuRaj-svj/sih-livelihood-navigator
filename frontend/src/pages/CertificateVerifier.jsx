import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { ShieldCheck, Search, LoaderCircle, AlertCircle, Upload, FileText, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CertificateVerifier = () => {
  const { user } = useAuth();
  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [myDocuments, setMyDocuments] = useState([]);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [documentFeedback, setDocumentFeedback] = useState({});
  const [identityMatchConfirmations, setIdentityMatchConfirmations] = useState({});

  const refreshDocuments = async () => {
    if (!user) return;
    try {
      if (user.role === 'BENEFICIARY') {
        const response = await client.get('/documents/mine');
        setMyDocuments(response.data.data || []);
      } else {
        const response = await client.get('/documents/pending');
        setPendingDocuments(response.data.data || []);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load document verification status');
    }
  };

  useEffect(() => {
    refreshDocuments();
  }, [user]);

  const downloadCertificate = () => {
    if (result?.certificateId) {
      window.open(`/api/certificates/download/${encodeURIComponent(result.certificateId)}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certificateId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await client.get(`/certificates/verify/${encodeURIComponent(certificateId.trim())}`);
      setResult(response.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (event) => {
    event.preventDefault();
    if (!documentFile) return setError('Select a certificate image to upload');
    const formData = new FormData();
    formData.append('document', documentFile);
    setDocumentLoading(true);
    setError('');
    try {
      await client.post('/documents/source-certificates', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDocumentFile(null);
      event.currentTarget.reset();
      await refreshDocuments();
    } catch (uploadError) {
      setError(uploadError.response?.data?.message || 'Document upload failed');
    } finally {
      setDocumentLoading(false);
    }
  };

  const reviewDocument = async (documentId, decision) => {
    const feedback = documentFeedback[documentId] || '';
    if (decision === 'REJECTED' && !feedback.trim()) return setError('Add feedback before rejecting the document');
    if (decision === 'VERIFIED' && !identityMatchConfirmations[documentId]) return setError('Confirm that the certificate identity matches the beneficiary before verifying');
    try {
      await client.patch(`/documents/${documentId}/review`, {
        decision,
        feedback,
        identityMatchConfirmed: decision === 'VERIFIED' && identityMatchConfirmations[documentId] === true,
      });
      setPendingDocuments((documents) => documents.filter((item) => item._id !== documentId));
    } catch (reviewError) {
      setError(reviewError.response?.data?.message || 'Unable to save document review');
    }
  };

  const downloadSourceDocument = async (documentId) => {
    try {
      const response = await client.get(`/documents/${documentId}/file`, { responseType: 'blob' });
      const objectUrl = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = 'beneficiary-certificate';
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch (downloadError) {
      setError(downloadError.response?.data?.message || 'Unable to download source document');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-12">
      <div className="max-w-2xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-primary)]/10 flex items-center justify-center text-[var(--color-accent-primary)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Verification</p>
              <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Certificate Checker</h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleVerify} className="p-8 space-y-6">
          <label className="block">
            <span className="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Certificate ID</span>
            <input
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              placeholder="CERT-..."
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[var(--color-accent-primary)] hover:opacity-90 text-white font-bold px-4 py-3 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Verifying...' : 'Verify Certificate'}
          </button>
        </form>

        {error && (
          <div className="px-8 pb-8">
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-red-300">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="px-8 pb-8">
            <div className={`rounded-2xl border p-4 ${result.verified ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' : 'border-amber-500/30 bg-amber-500/5 text-amber-300'}`}>
              <p className="text-sm font-bold uppercase tracking-wider">Status</p>
              <p className="mt-2 text-lg font-black">{result.verified ? 'Verified' : 'Not Valid'}</p>
              <div className="mt-4 space-y-2 text-sm">
                <p><span className="font-semibold">Certificate ID:</span> {result.certificateId}</p>
                <p><span className="font-semibold">Hash:</span> {result.recordHash}</p>
                <p><span className="font-semibold">Ledger:</span> {result.ledger?.network || 'local-hash-ledger'}</p>
                {result.verified && (
                  <button type="button" onClick={downloadCertificate} className="mt-3 rounded-xl bg-[var(--color-accent-primary)] px-4 py-2 font-bold text-white">
                    Download PDF Certificate
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {user?.role === 'BENEFICIARY' && (
        <section className="max-w-2xl mx-auto mt-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-xl">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-[var(--color-accent-secondary)]" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Source document</p>
              <h2 className="text-xl font-black text-[var(--color-text-primary)]">SC certificate review</h2>
            </div>
          </div>
          <form onSubmit={handleDocumentUpload} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block flex-1 text-sm font-bold text-[var(--color-text-secondary)]">
              Certificate image, up to 5 MB
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setDocumentFile(event.target.files?.[0] || null)} className="mt-2 block w-full text-sm" />
            </label>
            <button type="submit" disabled={documentLoading || !documentFile} className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-secondary)] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">
              {documentLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload for review
            </button>
          </form>
          <div className="mt-5 space-y-2">
            {myDocuments.map((item) => (
              <div key={item._id} className="flex flex-col gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[var(--color-text-primary)]">{item.originalName}</span>
                  <span className="block text-[10px] text-[var(--color-text-muted)]">Submitted {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'date unavailable'}</span>
                </div>
                <span className={`text-xs font-bold ${item.verificationStatus === 'VERIFIED' ? 'text-emerald-600' : item.verificationStatus === 'REJECTED' ? 'text-red-600' : 'text-amber-600'}`}>
                  {item.verificationStatus.replace('_', ' ')}{item.reviewFeedback ? `: ${item.reviewFeedback}` : ''}
                </span>
                {(item.reviewHistory || []).length > 0 && (
                  <details className="w-full border-t border-[var(--color-border)] pt-2">
                    <summary className="cursor-pointer text-xs font-bold text-[var(--color-accent-secondary)]">Review history ({item.reviewHistory.length})</summary>
                    <ol className="mt-2 space-y-2">
                      {item.reviewHistory.slice().reverse().map((review, index) => (
                        <li key={`${review.reviewedAt}-${index}`} className="text-xs text-[var(--color-text-secondary)]">
                          <span className="font-bold text-[var(--color-text-primary)]">{review.decision}</span>
                          {' · '}{review.reviewedBy?.name || 'Officer'}
                          {review.identityMatchConfirmed && ' · identity matched'}
                          {review.feedback && <span className="block">{review.feedback}</span>}
                          <time className="block text-[10px] text-[var(--color-text-muted)]">{review.reviewedAt ? new Date(review.reviewedAt).toLocaleString() : ''}</time>
                        </li>
                      ))}
                    </ol>
                  </details>
                )}
              </div>
            ))}
            {myDocuments.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">No source documents uploaded.</p>}
          </div>
        </section>
      )}

      {(user?.role === 'OFFICER' || user?.role === 'ADMIN') && (
        <section className="max-w-4xl mx-auto mt-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-xl space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">OCR and QR evidence</p>
            <h2 className="text-xl font-black text-[var(--color-text-primary)]">Source certificate review queue</h2>
          </div>
          {pendingDocuments.map((item) => (
            <article key={item._id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-[var(--color-text-primary)]">{item.beneficiaryId?.userId?.name || 'Beneficiary'} · {item.originalName}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">Profile ID: {item.beneficiaryId?._id || 'Unavailable'} · {item.beneficiaryId?.userId?.email || item.beneficiaryId?.userId?.phone || 'No contact on file'}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">OCR: {item.ocrStatus} · QR: {item.qrPayload ? 'detected' : 'not detected'}</p>
                </div>
                <button type="button" onClick={() => downloadSourceDocument(item._id)} title="Download source document" className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-text-secondary)]"><Download className="h-4 w-4" /></button>
              </div>
              {item.qrPayload && <p className="break-all text-xs text-[var(--color-text-secondary)]">QR payload: {item.qrPayload}</p>}
              <details>
                <summary className="cursor-pointer text-xs font-bold text-[var(--color-accent-secondary)]">View extracted text</summary>
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--color-surface)] p-3 text-xs text-[var(--color-text-primary)]">{item.ocrText || 'No text was extracted.'}</pre>
              </details>
              <label className="flex items-start gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs font-semibold text-[var(--color-text-secondary)]">
                <input
                  type="checkbox"
                  checked={identityMatchConfirmations[item._id] || false}
                  onChange={(event) => setIdentityMatchConfirmations((current) => ({ ...current, [item._id]: event.target.checked }))}
                  className="mt-0.5 accent-emerald-600"
                />
                I checked the original certificate and confirm its identity details match this beneficiary profile.
              </label>
              <textarea value={documentFeedback[item._id] || ''} onChange={(event) => setDocumentFeedback((current) => ({ ...current, [item._id]: event.target.value }))} rows={2} placeholder="Feedback required when rejecting" className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => reviewDocument(item._id, 'REJECTED')} className="rounded-xl border border-red-300 px-3 py-2 text-sm font-bold text-red-700">Reject</button>
                <button type="button" onClick={() => reviewDocument(item._id, 'VERIFIED')} disabled={!identityMatchConfirmations[item._id]} className="rounded-xl bg-[var(--color-accent-secondary)] px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Verify certificate and ID</button>
              </div>
            </article>
          ))}
          {pendingDocuments.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">No source certificates are pending review.</p>}
        </section>
      )}
    </div>
  );
};

export default CertificateVerifier;
