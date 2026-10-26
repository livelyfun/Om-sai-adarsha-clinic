'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Key,
  Copy,
  Check,
  UserCheck,
  UserX,
  Phone,
  Calendar,
  FileText,
  Clock,
  X,
  AlertCircle,
  CheckCircle2,
  Shield,
  Activity,
} from 'lucide-react';

interface PatientRecord {
  id: string;
  fullName: string;
  relationshipLabel: string;
  dob?: string | null;
  sex?: string;
  phone?: string | null;
  isLinked: boolean;
  managingUserEmail?: string | null;
  appointmentsCount: number;
  labBookingsCount: number;
  reportsCount: number;
  createdAt: string;
}

export default function CmsPatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'linked' | 'walkin'>('all');
  const [canManage, setCanManage] = useState(false);

  // New Walk-in Patient Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | 'other'>('male');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  // Claim Code Modal
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [generatedCode, setGeneratedCode] = useState<{
    code: string;
    expiresAt: string;
    patientName: string;
  } | null>(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPatients() {
      try {
        const res = await fetch('/api/cms/patients');
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setPatients(data.profiles || []);
            setCanManage(Boolean(data.canManage));
          }
        }
      } catch (err) {
        console.error('Failed to load patients:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPatients();

    return () => {
      active = false;
    };
  }, []);

  async function handleCreateWalkIn(e: React.FormEvent) {
    e.preventDefault();
    setAddError('');
    if (!fullName.trim()) {
      setAddError('Patient name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/cms/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim() || null,
          dateOfBirth: dateOfBirth || null,
          sex,
          bloodGroup: bloodGroup.trim() || null,
          address: address.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register patient');
      }

      setShowAddModal(false);
      setFullName('');
      setPhone('');
      setDateOfBirth('');
      setBloodGroup('');
      setAddress('');

      // Refresh list
      const refRes = await fetch('/api/cms/patients');
      if (refRes.ok) {
        const refData = await refRes.json();
        setPatients(refData.profiles || []);
      }
    } catch (err: any) {
      setAddError(err.message || 'Error registering patient');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGenerateClaim(patient: PatientRecord) {
    setSelectedPatient(patient);
    setGeneratedCode(null);
    setClaimError('');
    setCopied(false);
    setShowClaimModal(true);
    setClaimLoading(true);

    try {
      const res = await fetch('/api/cms/claim-codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: patient.id }),
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
      setClaimError(err.message || 'Failed to generate code');
    } finally {
      setClaimLoading(false);
    }
  }

  function handleCopyCode() {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const filteredPatients = patients.filter(p => {
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'linked' && p.isLinked) ||
      (filterType === 'walkin' && !p.isLinked);

    const q = search.toLowerCase();
    const matchesSearch =
      p.fullName.toLowerCase().includes(q) ||
      (p.phone && p.phone.toLowerCase().includes(q)) ||
      (p.managingUserEmail && p.managingUserEmail.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  const totalPatients = patients.length;
  const linkedPatients = patients.filter(p => p.isLinked).length;
  const walkinPatients = totalPatients - linkedPatients;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
            Clinical Operations
          </span>
          <h1 className="text-2xl font-bold text-white font-serif mt-0.5 flex items-center gap-2.5">
            <Users className="h-6 w-6 text-teal-400" />
            <span>Patient Registry & Walk-in Records</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage registered clinical patient profiles, walk-in records, and issue account linking claim codes.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Register Walk-in Patient</span>
          </button>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Registered Profiles</span>
            <Users className="h-4 w-4 text-teal-400" />
          </div>
          <p className="text-2xl font-bold text-white">{totalPatients}</p>
          <p className="text-[11px] text-slate-500">All outpatient medical profiles</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Linked to Online Account</span>
            <UserCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{linkedPatients}</p>
          <p className="text-[11px] text-slate-500">Patients managing via web portal</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Walk-in / Unlinked Profiles</span>
            <UserX className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{walkinPatients}</p>
          <p className="text-[11px] text-slate-500">Eligible for 7-day claim code linking</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, phone, or account email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-teal-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Patients ({totalPatients})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('linked')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'linked'
                ? 'bg-emerald-700 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Linked Accounts ({linkedPatients})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('walkin')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'walkin'
                ? 'bg-amber-700 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Walk-in Unlinked ({walkinPatients})
          </button>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading patient records...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Users className="h-10 w-10 text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-300">No patient records found</p>
            <p className="text-xs text-slate-500">Try adjusting your search query or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Patient Name</th>
                  <th className="py-3 px-4 font-semibold">Sex / DOB</th>
                  <th className="py-3 px-4 font-semibold">Contact & Address</th>
                  <th className="py-3 px-4 font-semibold">Account Status</th>
                  <th className="py-3 px-4 font-semibold">Clinical Records</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {p.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-xs leading-snug">{p.fullName}</p>
                          <span className="text-[10px] text-slate-400 capitalize">
                            Profile: {p.relationshipLabel || 'self'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="capitalize">{p.sex || '—'}</span>
                      {p.dob && (
                        <span className="text-slate-500 block text-[11px] mt-0.5">
                          DOB: {p.dob}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {p.phone ? (
                        <span className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Phone className="h-3 w-3 text-slate-500" />
                          <span>{p.phone}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">No phone on file</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {p.isLinked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Linked Account</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-medium">
                          <Key className="h-3 w-3" />
                          <span>Walk-in (Unlinked)</span>
                        </span>
                      )}
                      {p.managingUserEmail && (
                        <span className="text-[10px] text-slate-500 block truncate max-w-[160px] mt-0.5">
                          {p.managingUserEmail}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-3 text-[11px]">
                        <span title="Doctor Appointments">
                          📅 <strong>{p.appointmentsCount}</strong>
                        </span>
                        <span title="Lab Bookings">
                          🧪 <strong>{p.labBookingsCount}</strong>
                        </span>
                        <span title="Lab Reports">
                          📄 <strong>{p.reportsCount}</strong>
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => handleGenerateClaim(p)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600/20 border border-teal-500/30 hover:bg-teal-600/30 text-teal-300 px-3 py-1.5 text-xs font-semibold transition-colors"
                        >
                          <Key className="h-3.5 w-3.5" />
                          <span>Issue Claim Code</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Walk-in Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-400" />
                <h3 className="font-bold text-white text-sm">Register Walk-in Patient Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {addError && (
              <div className="rounded-xl bg-red-950/80 border border-red-800/60 p-3 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleCreateWalkIn} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Patient Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar Shrestha"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Sex / Gender
                  </label>
                  <select
                    value={sex}
                    onChange={(e: any) => setSex(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:outline-hidden focus:border-teal-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    placeholder="e.g. O+ / B+"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Ward 4, Janakpur"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-teal-600 hover:bg-teal-500 px-5 py-2 text-white font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Save Walk-in Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claim Code Modal */}
      {showClaimModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-teal-400">
                <Key className="h-5 w-5" />
                <h3 className="font-bold text-white text-sm">Issue Walk-in Claim Code</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowClaimModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Provide this single-use claim code to <strong className="text-white">{selectedPatient.fullName}</strong>. They can enter this code in their Patient Portal under <em>&quot;Claim Walk-in Records&quot;</em> to link this profile and access all past and future lab reports online.
            </p>

            {claimLoading && (
              <div className="p-8 text-center text-xs text-slate-400">
                Generating cryptographically secure claim code...
              </div>
            )}

            {claimError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200">
                {claimError}
              </div>
            )}

            {generatedCode && (
              <div className="space-y-4 pt-2">
                <div className="rounded-2xl border-2 border-teal-500/50 bg-teal-950/40 p-4 text-center space-y-2">
                  <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">
                    7-Day Secure Claim Code
                  </span>
                  <div className="font-mono text-2xl font-bold tracking-widest text-white selection:bg-teal-500">
                    {generatedCode.code}
                  </div>
                  <p className="text-[11px] text-teal-200/70">
                    Expires on {new Date(generatedCode.expiresAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 py-2.5 text-xs font-semibold text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Claim Code</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowClaimModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
