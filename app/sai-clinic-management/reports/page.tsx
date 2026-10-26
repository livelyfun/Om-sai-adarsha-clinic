'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Download,
  Key,
  Shield,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  Copy,
  Plus,
} from 'lucide-react';

interface ReportItem {
  id: string;
  labBookingId: string;
  profileId: string;
  version: number;
  status: 'draft' | 'released' | 'superseded' | 'revoked';
  originalFilename: string;
  fileSize: number;
  checksumSha256: string;
  referenceNo: string;
  patientName: string;
  relationshipLabel: string;
  tests: string;
  confirmedAt: string;
  releasedAt?: string | null;
  revokedAt?: string | null;
  revokeReason?: string | null;
}

export default function CmsReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [labBookings, setLabBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [canRelease, setCanRelease] = useState(false);
  const [canRevoke, setCanRevoke] = useState(false);
  const [canUpload, setCanUpload] = useState(false);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState<ReportItem | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Upload Form State
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Revoke Form State
  const [revokeReason, setRevokeReason] = useState('');

  // Claim Code State
  const [claimProfileId, setClaimProfileId] = useState('');
  const [generatedCode, setGeneratedCode] = useState<{
    code: string;
    expiresAt: string;
    patientName: string;
  } | null>(null);
  const [claimError, setClaimError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [reportsRes, bookingsRes] = await Promise.all([
        fetch('/api/cms/reports'),
        fetch('/api/cms/bookings/labs'),
      ]);

      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setReports(data.reports || []);
        setCanRelease(data.canRelease || false);
        setCanRevoke(data.canRevoke || false);
        setCanUpload(data.canUpload || false);
      }

      if (bookingsRes.ok) {
        const bData = await bookingsRes.json();
        setLabBookings(bData.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!selectedBookingId) {
      setFormError('Please select a laboratory booking.');
      return;
    }
    if (!selectedFile) {
      setFormError('Please select a PDF report file.');
      return;
    }
    if (!verificationChecked) {
      setFormError('Mandatory confirmation: You must verify that this report belongs to this patient and booking.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('labBookingId', selectedBookingId);
      formData.append('patientConfirmationVerified', 'true');

      const res = await fetch('/api/cms/reports/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload report');
      }

      setFormSuccess(`Report uploaded successfully as draft (Version ${data.report.version})!`);
      setSelectedFile(null);
      setSelectedBookingId('');
      setVerificationChecked(false);
      setShowUploadModal(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRelease(report: ReportItem) {
    if (!confirm(`Release laboratory report Version ${report.version} for ${report.patientName}? This will make the report visible for patient download in their portal.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/cms/reports/${report.id}/release`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to release report');
        return;
      }
      await loadData();
    } catch (err) {
      console.error('Failed to release report:', err);
    }
  }

  async function handleRevoke(e: React.FormEvent) {
    e.preventDefault();
    if (!showRevokeModal) return;
    if (!revokeReason.trim()) {
      alert('Revocation reason is required.');
      return;
    }

    try {
      const res = await fetch(`/api/cms/reports/${showRevokeModal.id}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: revokeReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to revoke report');
        return;
      }
      setShowRevokeModal(null);
      setRevokeReason('');
      await loadData();
    } catch (err) {
      console.error('Failed to revoke report:', err);
    }
  }

  async function handleGenerateClaimCode(e: React.FormEvent) {
    e.preventDefault();
    setClaimError('');
    setGeneratedCode(null);

    if (!claimProfileId) {
      setClaimError('Please select a patient profile.');
      return;
    }

    try {
      const res = await fetch('/api/cms/claim-codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: claimProfileId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate claim code');
      }

      setGeneratedCode({
        code: data.claimCode,
        expiresAt: data.expiresAt,
        patientName: data.patientName,
      });
    } catch (err: any) {
      setClaimError(err.message || 'Error generating claim code');
    }
  }

  const filteredReports = reports.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch =
      r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.referenceNo.toLowerCase().includes(search.toLowerCase()) ||
      r.originalFilename.toLowerCase().includes(search.toLowerCase()) ||
      r.tests.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Extract unique patient profiles from labBookings for claim generator
  const uniqueProfiles = Array.from(
    new Map(
      labBookings.map(b => [b.profileId, { id: b.profileId, name: b.patientNameSnapshot || 'Patient' }])
    ).values()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-teal-400" />
            <span>Laboratory Reports Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Secure PDF report storage, multi-version lifecycle (Draft, Released, Revoked), and walk-in claim codes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setGeneratedCode(null);
              setClaimError('');
              setShowClaimModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Key className="h-4 w-4 text-amber-400" />
            <span>Walk-in Claim Code</span>
          </button>

          {canUpload && (
            <button
              type="button"
              onClick={() => {
                setFormError('');
                setFormSuccess('');
                setShowUploadModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between py-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient, reference, filename..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-teal-500"
          >
            <option value="all">All Statuses ({reports.length})</option>
            <option value="draft">Draft (Review Pending)</option>
            <option value="released">Released (Live)</option>
            <option value="superseded">Superseded (Older Revision)</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading laboratory reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-300">No laboratory reports found</p>
            <p className="text-xs text-slate-500 mt-1">
              Upload a verified laboratory report for a confirmed lab booking to begin.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Booking Ref</th>
                  <th className="py-3 px-4 font-semibold">Patient</th>
                  <th className="py-3 px-4 font-semibold">Tests Included</th>
                  <th className="py-3 px-4 font-semibold">Version</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">File & Size</th>
                  <th className="py-3 px-4 font-semibold">Uploaded</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredReports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-400">
                      {report.referenceNo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{report.patientName}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{report.relationshipLabel}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                      {report.tests}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono px-2 py-0.5 rounded-sm bg-slate-800 border border-slate-700 text-slate-300 font-bold">
                        v{report.version}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {report.status === 'draft' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Draft (Review)
                        </span>
                      )}
                      {report.status === 'released' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Released
                        </span>
                      )}
                      {report.status === 'superseded' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          Superseded
                        </span>
                      )}
                      {report.status === 'revoked' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20" title={report.revokeReason || 'Revoked'}>
                          <XCircle className="h-3 w-3" />
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300 truncate max-w-[150px]" title={report.originalFilename}>
                        {report.originalFilename}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {Math.round(report.fileSize / 1024)} KB
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(report.confirmedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/api/reports/${report.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Preview / Download PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>

                        {canRelease && report.status === 'draft' && (
                          <button
                            type="button"
                            onClick={() => handleRelease(report)}
                            className="px-2.5 py-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-semibold text-[11px] transition-colors"
                          >
                            Release
                          </button>
                        )}

                        {canRevoke && report.status === 'released' && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowRevokeModal(report);
                              setRevokeReason('');
                            }}
                            className="px-2.5 py-1 rounded-md bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-semibold text-[11px] transition-colors"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-teal-400" />
                <span>Upload Laboratory Report (PDF)</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Lab Booking Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Lab Booking <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedBookingId}
                  onChange={e => setSelectedBookingId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-teal-500"
                  required
                >
                  <option value="">-- Choose lab booking --</option>
                  {labBookings.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.referenceNo} — {b.patientNameSnapshot || 'Patient'} ({new Date(b.preferredTime).toLocaleDateString()}) [{b.status}]
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Reports can only be uploaded against established laboratory booking records.
                </p>
              </div>

              {/* File Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Report PDF Document <span className="text-rose-400">*</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-500"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Strictly PDF files only (verified via %PDF- magic bytes). Maximum file size 10MB.
                </p>
              </div>

              {/* Mandatory Staff Verification Checkbox */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 mt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verificationChecked}
                    onChange={e => setVerificationChecked(e.target.checked)}
                    className="mt-0.5 rounded-sm border-slate-700 text-teal-600 focus:ring-teal-500"
                    required
                  />
                  <div className="text-xs text-amber-200">
                    <span className="font-bold block text-white">Staff Patient-Matching Confirmation</span>
                    I have verified that this PDF report matches the identity of the selected patient and corresponds to this lab booking.
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !verificationChecked}
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Uploading...' : 'Save as Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-900/50 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                <span>Revoke Laboratory Report</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowRevokeModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRevoke} className="mt-4 space-y-4">
              <div className="text-xs text-slate-300">
                Revoking report version <strong>v{showRevokeModal.version}</strong> for{' '}
                <strong>{showRevokeModal.patientName}</strong> will immediately withdraw it from the patient portal.
                The patient will see that the report was revoked and must contact reception.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Revocation Reason <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={revokeReason}
                  onChange={e => setRevokeReason(e.target.value)}
                  placeholder="e.g. Sample hemolysis detected / Doctor requested recollection / Clerical correction"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-hidden focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRevokeModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  Confirm Revocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Walk-in Claim Code Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-400" />
                <span>Generate Walk-in Claim Code</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowClaimModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-300">
                Walk-in patients who register at reception can redeem this code inside their online patient portal to link their family profile and access digital reports.
              </p>

              {claimError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs">
                  {claimError}
                </div>
              )}

              {!generatedCode ? (
                <form onSubmit={handleGenerateClaimCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Select Patient Profile <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={claimProfileId}
                      onChange={e => setClaimProfileId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                      required
                    >
                      <option value="">-- Choose patient --</option>
                      {uniqueProfiles.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.id.slice(0, 8)}...)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowClaimModal(false)}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white shadow-xs transition-colors"
                    >
                      Generate Code
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-center py-2">
                  <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-5">
                    <span className="text-xs text-slate-400 block mb-1">
                      One-Time Claim Code for {generatedCode.patientName}
                    </span>
                    <span className="font-mono text-2xl font-black text-amber-400 tracking-wider">
                      {generatedCode.code}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-2">
                      Valid for 7 days (Expires {new Date(generatedCode.expiresAt).toLocaleDateString()})
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCode.code);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                    >
                      {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowClaimModal(false)}
                      className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
