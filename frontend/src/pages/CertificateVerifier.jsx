import React, { useState } from 'react';
import client from '../api/client';
import { ShieldCheck, Search, LoaderCircle, AlertCircle } from 'lucide-react';

const CertificateVerifier = () => {
  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

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
    </div>
  );
};

export default CertificateVerifier;
