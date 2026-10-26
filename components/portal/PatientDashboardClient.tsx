'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  FlaskConical,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X,
  UserPlus,
  KeyRound,
} from 'lucide-react';
import { Appointment, LabBooking, PatientProfile, LabReport } from '@/lib/db/types';
import { Locale } from '@/lib/i18n';

interface PatientDashboardClientProps {
  locale: Locale;
  messages: any;
  user: any;
  profiles: PatientProfile[];
  appointments: Appointment[];
  labBookings: LabBooking[];
  reports?: LabReport[];
}

export default function PatientDashboardClient({
  locale,
  messages,
  user,
  profiles,
  appointments,
  labBookings,
  reports = [],
}: PatientDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'lab' | 'reports' | 'profiles'>('upcoming');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDob, setNewProfileDob] = useState('');
  const [newProfileSex, setNewProfileSex] = useState('female');
  const [newProfileRelation, setNewProfileRelation] = useState('child');

  // Claim Code State
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimCodeInput, setClaimCodeInput] = useState('');
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);

  const t = messages.dashboard;
  const common = messages.common;
  const bookingMessages = messages.booking;

  const isVerified = Boolean(user.emailVerifiedAt);

  // Split upcoming vs past bookings
  const upcomingAppointments = appointments.filter(a =>
    ['pending', 'confirmed', 'reschedule_proposed'].includes(a.status)
  );
  const pastAppointments = appointments.filter(a =>
    ['declined', 'cancelled', 'completed', 'no_show'].includes(a.status)
  );

  const upcomingLabs = labBookings.filter(l =>
    ['pending', 'confirmed', 'reschedule_proposed'].includes(l.status)
  );
  const pastLabs = labBookings.filter(l =>
    ['declined', 'cancelled', 'completed', 'no_show'].includes(l.status)
  );

  async function handleTransition(
    bookingType: 'appointment' | 'lab',
    bookingId: string,
    targetStatus: string,
    proposedStart?: string
  ) {
    setActionLoading(bookingId);
    setActionError('');
    try {
      const res = await fetch('/api/bookings/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingType,
          bookingId,
          targetStatus,
          proposedStartTime: proposedStart,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Action failed');
      }

      router.refresh();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update booking status.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCreateFamilyProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!newProfileName) return;
    try {
      const res = await fetch('/api/portal/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newProfileName,
          dob: newProfileDob,
          sex: newProfileSex,
          relationshipLabel: newProfileRelation,
        }),
      });
      if (res.ok) {
        setShowAddProfileModal(false);
        setNewProfileName('');
        router.refresh();
      }
    } catch (err) {
      console.error('Error creating profile:', err);
    }
  }

  async function handleClaimCode(e: React.FormEvent) {
    e.preventDefault();
    setClaimError('');
    setClaimSuccess('');
    if (!claimCodeInput.trim()) {
      setClaimError(locale === 'ne' ? 'कृपया दावी कोड प्रविष्ट गर्नुहोस्' : 'Please enter a claim code.');
      return;
    }

    setIsClaiming(true);
    try {
      const res = await fetch('/api/portal/claim-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: claimCodeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim code');
      }

      setClaimSuccess(data.message || 'Profile successfully claimed!');
      setClaimCodeInput('');
      setTimeout(() => {
        setShowClaimModal(false);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setClaimError(err.message || 'Error claiming code');
    } finally {
      setIsClaiming(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3 text-emerald-700" />
            <span>{bookingMessages.statusConfirmed}</span>
          </span>
        );
      case 'reschedule_proposed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
            <AlertTriangle className="h-3 w-3 text-amber-700" />
            <span>{bookingMessages.statusRescheduleProposed}</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-0.5 rounded-full">
            <Clock className="h-3 w-3 text-slate-600" />
            <span>{bookingMessages.statusPending}</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full">
            <span>{bookingMessages.statusCompleted}</span>
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-red-100 text-red-900 px-2.5 py-0.5 rounded-full">
            <span>{bookingMessages.statusDeclined}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
            <span>{bookingMessages.statusCancelled}</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  }

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-800 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Add Family Profile Modal */}
      {showAddProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">{t.addFamilyMember}</h3>
              <button type="button" onClick={() => setShowAddProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFamilyProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="e.g. Maya Sharma"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship *</label>
                  <select
                    value={newProfileRelation}
                    onChange={(e) => setNewProfileRelation(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900"
                  >
                    <option value="child">Child (छोरा/छोरी)</option>
                    <option value="parent">Parent (आमा/बुवा)</option>
                    <option value="spouse">Spouse (पति/पत्नी)</option>
                    <option value="sibling">Sibling (दाजुभाइ/दिदीबहिनी)</option>
                    <option value="other">Other Dependent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sex</label>
                  <select
                    value={newProfileSex}
                    onChange={(e) => setNewProfileSex(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={newProfileDob}
                  onChange={(e) => setNewProfileDob(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProfileModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-800 hover:bg-teal-900 px-5 py-2 text-xs font-semibold text-white"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Redeem Walk-in Claim Code Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-teal-800" />
                <h3 className="font-bold text-slate-900 text-base">
                  {locale === 'ne' ? 'दावी कोड प्रविष्ट गर्नुहोस्' : 'Redeem Walk-in Claim Code'}
                </h3>
              </div>
              <button type="button" onClick={() => setShowClaimModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {claimError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                <span>{claimError}</span>
              </div>
            )}

            {claimSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{claimSuccess}</span>
              </div>
            )}

            <form onSubmit={handleClaimCode} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {locale === 'ne'
                  ? 'क्लिनिक रिसेप्शनबाट प्राप्त १०-अङ्कको दावी कोड (जस्तै CL-XXXX-XXXX) प्रविष्ट गर्नुहोस्। यसले तपाईंको खातासँग पुरानो वा वाक-इन प्रोफाइल र ल्याब रिपोर्टहरू जोड्दछ।'
                  : 'Enter the 10-character claim code (e.g. CL-XXXX-XXXX) printed on your clinic receipt to connect your walk-in profile and view digital laboratory reports.'}
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {locale === 'ne' ? 'दावी कोड *' : 'Claim Code *'}
                </label>
                <input
                  type="text"
                  required
                  value={claimCodeInput}
                  onChange={(e) => setClaimCodeInput(e.target.value.toUpperCase())}
                  placeholder="CL-XXXX-XXXX"
                  className="w-full font-mono font-bold tracking-wider rounded-xl border border-slate-300 py-2.5 px-3 text-sm text-slate-900 uppercase"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isClaiming || !claimCodeInput.trim()}
                  className="rounded-xl bg-teal-800 hover:bg-teal-900 disabled:opacity-50 px-5 py-2 text-xs font-semibold text-white shadow-xs"
                >
                  {isClaiming ? 'Linking...' : (locale === 'ne' ? 'प्रमाणित गर्नुहोस्' : 'Claim & Link')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dashboard Tabs Header */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-xs sm:text-sm font-semibold overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'upcoming'
                ? 'border-teal-800 text-teal-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>{t.tabUpcoming}</span>
            <span className="px-2 py-0.5 text-xs bg-slate-100 rounded-full font-bold">
              {upcomingAppointments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lab')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'lab'
                ? 'border-teal-800 text-teal-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FlaskConical className="h-4 w-4" />
            <span>{t.tabLab}</span>
            <span className="px-2 py-0.5 text-xs bg-slate-100 rounded-full font-bold">
              {upcomingLabs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'reports'
                ? 'border-teal-800 text-teal-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>{locale === 'ne' ? 'ल्याब रिपोर्टहरू' : 'Lab Reports'}</span>
            <span className="px-2 py-0.5 text-xs bg-teal-100 text-teal-900 rounded-full font-bold">
              {reports.filter(r => r.status === 'released').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'past'
                ? 'border-teal-800 text-teal-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{t.tabPast}</span>
            <span className="px-2 py-0.5 text-xs bg-slate-100 rounded-full font-bold">
              {pastAppointments.length + pastLabs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profiles')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'profiles'
                ? 'border-teal-800 text-teal-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>{t.tabProfiles}</span>
            <span className="px-2 py-0.5 text-xs bg-slate-100 rounded-full font-bold">
              {profiles.length}
            </span>
          </button>
        </nav>
      </div>

      {/* TAB 1: UPCOMING APPOINTMENTS */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
              <Calendar className="mx-auto h-8 w-8 text-slate-300" />
              <p className="text-sm font-semibold text-slate-800">
                {locale === 'ne' ? 'कुनै आगामी अपोइन्टमेन्ट अनुरोध छैन' : 'No active appointment requests'}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {locale === 'ne'
                  ? 'चिकित्सक वा स्वास्थ्य सेवाको लागि नयाँ बुकिङ अनुरोध पेश गर्नुहोस्।'
                  : 'Submit a consultation request online. All requests are confirmed directly by clinic reception.'}
              </p>
              <Link
                href={`/${locale}/book`}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-teal-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-teal-900 shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>{common.bookSession}</span>
              </Link>
            </div>
          ) : (
            upcomingAppointments.map((apt) => {
              const profile = profiles.find(p => p.id === apt.profileId);
              const isRescheduleProposed = apt.status === 'reschedule_proposed';
              const isLoading = actionLoading === apt.id;

              return (
                <div
                  key={apt.id}
                  className={`rounded-2xl border bg-white p-6 shadow-xs space-y-4 transition-all ${
                    isRescheduleProposed ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-teal-900 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                        {apt.referenceNo}
                      </span>
                      {getStatusBadge(apt.status)}
                    </div>
                    <span className="text-xs text-slate-500">
                      Patient: <strong className="text-slate-800">{profile?.fullName || 'Family Member'}</strong> ({profile?.relationshipLabel})
                    </span>
                  </div>

                  {/* Reschedule Action Needed Banner */}
                  {isRescheduleProposed && (
                    <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-950 text-xs sm:text-sm">
                            {bookingMessages.actionNeededReschedule}
                          </p>
                          {apt.patientMessage && (
                            <p className="text-xs text-amber-900 mt-1 italic">
                              Reception Note: &quot;{apt.patientMessage}&quot;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleTransition('appointment', apt.id, 'confirmed')}
                          className="rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-xs"
                        >
                          {bookingMessages.acceptProposal}
                        </button>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleTransition('appointment', apt.id, 'cancelled')}
                          className="rounded-xl bg-slate-200 hover:bg-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-800"
                        >
                          {bookingMessages.declineProposal}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Provider / Service:</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">{apt.doctorNameSnapshot}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Requested Time:</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">
                        {new Date(apt.startTime).toLocaleDateString()} at {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Consultation Fee:</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">NPR {apt.feeSnapshot}</span>
                    </div>
                  </div>

                  {apt.patientNotes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <strong>Patient Note:</strong> {apt.patientNotes}
                    </p>
                  )}

                  {/* Actions allowed */}
                  {!isRescheduleProposed && apt.status !== 'cancelled' && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleTransition('appointment', apt.id, 'cancelled')}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline"
                      >
                        {bookingMessages.cancelBooking}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: LAB BOOKINGS */}
      {activeTab === 'lab' && (
        <div className="space-y-4">
          {upcomingLabs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
              <FlaskConical className="mx-auto h-8 w-8 text-cyan-400" />
              <p className="text-sm font-semibold text-slate-800">
                {locale === 'ne' ? 'कुनै सक्रिय ल्याब अनुरोध छैन' : 'No active laboratory bookings'}
              </p>
              <Link
                href={`/${locale}/lab-tests`}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-cyan-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-cyan-900"
              >
                <span>{locale === 'ne' ? 'ल्याब परीक्षण अनुरोध गर्नुहोस्' : 'Request Lab Tests'}</span>
              </Link>
            </div>
          ) : (
            upcomingLabs.map((lab) => {
              const profile = profiles.find(p => p.id === lab.profileId);
              const isLoading = actionLoading === lab.id;

              return (
                <div key={lab.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-cyan-900 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200">
                        {lab.referenceNo}
                      </span>
                      {getStatusBadge(lab.status)}
                    </div>
                    <span className="text-xs text-slate-500">
                      Patient: <strong className="text-slate-800">{profile?.fullName}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Preferred Visit Time:</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">
                        {new Date(lab.preferredTime).toLocaleDateString()} at {new Date(lab.preferredTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Estimated Charges:</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">NPR {lab.estimatedTotal} (Counter settlement)</span>
                    </div>
                  </div>

                  {lab.status === 'pending' && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleTransition('lab', lab.id, 'cancelled')}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline"
                      >
                        {bookingMessages.cancelBooking}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB: LAB REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {locale === 'ne' ? 'प्रमाणित ल्याब रिपोर्टहरू' : 'Verified Laboratory Reports'}
              </h3>
              <p className="text-xs text-slate-500">
                {locale === 'ne'
                  ? 'क्लिनिक कर्मचारीद्वारा प्रमाणीकरण र जारी गरिएका डिजिटल पीडीएफ रिपोर्टहरू।'
                  : 'Official digitally verified reports released by clinic staff for you and your family profiles.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setClaimCodeInput('');
                setClaimError('');
                setClaimSuccess('');
                setShowClaimModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 px-4 py-2 text-xs font-semibold text-white shadow-xs shrink-0"
            >
              <KeyRound className="h-4 w-4 text-teal-200" />
              <span>{locale === 'ne' ? 'दावी कोड जोड्नुहोस्' : 'Link Walk-in Report'}</span>
            </button>
          </div>

          {/* Filter out draft reports from patient view */}
          {reports.filter(r => r.status !== 'draft').length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
              <FileText className="mx-auto h-8 w-8 text-teal-600" />
              <p className="text-sm font-semibold text-slate-800">
                {locale === 'ne' ? 'अहिलेसम्म कुनै ल्याब रिपोर्ट जारी गरिएको छैन' : 'No laboratory reports released yet'}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {locale === 'ne'
                  ? 'तपाईंको नमुना संकलन र क्लिनिकल प्रमाणीकरण सम्पन्न भएपछि, रिपोर्ट यहाँ उपलब्ध हुनेछ। वाक-इन रसिद भएको खण्डमा "दावी कोड जोड्नुहोस्" थिच्नुहोस्।'
                  : 'Once your lab sample is processed and reviewed by staff, your official PDF report will appear here. If you visited as a walk-in, click "Link Walk-in Report" with your receipt code.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.filter(r => r.status !== 'draft').map((report) => {
                const profile = profiles.find(p => p.id === report.profileId);
                const isReleased = report.status === 'released';
                const isRevoked = report.status === 'revoked';
                const isSuperseded = report.status === 'superseded';

                return (
                  <div key={report.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-teal-900 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                          v{report.version}
                        </span>
                        {isReleased && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                            <span>{locale === 'ne' ? 'जारी गरिएको' : 'Released'}</span>
                          </span>
                        )}
                        {isSuperseded && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                            <span>{locale === 'ne' ? 'पुरानो संशोधन (Superseded)' : 'Superseded (Older Revision)'}</span>
                          </span>
                        )}
                        {isRevoked && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300 px-2.5 py-0.5 rounded-full">
                            <XCircle className="h-3 w-3 text-rose-700" />
                            <span>{locale === 'ne' ? 'रद्द गरिएको' : 'Revoked'}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {locale === 'ne' ? 'बिरामी:' : 'Patient:'} <strong className="text-slate-800">{profile?.fullName || 'Family Member'}</strong>
                      </span>
                    </div>

                    {/* Revocation Warning */}
                    {isRevoked && (
                      <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-900 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-rose-950">
                          <AlertTriangle className="h-4 w-4 text-rose-600" />
                          <span>{locale === 'ne' ? 'रिपोर्ट क्लिनिकद्वारा रद्द गरिएको छ' : 'Report Revoked by Clinic'}</span>
                        </div>
                        <p>{report.revokeReason || (locale === 'ne' ? 'थप जानकारीको लागि क्लिनिक रिसेप्शनमा सम्पर्क गर्नुहोस्।' : 'Please contact clinic reception for recollection or updated findings.')}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">{locale === 'ne' ? 'फाइल नाम:' : 'Document File:'}</span>
                        <span className="font-bold text-slate-900 mt-0.5 block truncate" title={report.originalFilename}>
                          {report.originalFilename}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">{locale === 'ne' ? 'जारी मिति:' : 'Released Date:'}</span>
                        <span className="font-bold text-slate-900 mt-0.5 block">
                          {report.releasedAt ? new Date(report.releasedAt).toLocaleDateString() : new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">{locale === 'ne' ? 'साइज:' : 'File Size:'}</span>
                        <span className="font-bold text-slate-900 mt-0.5 block">
                          {Math.round(report.fileSize / 1024)} KB
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-xs">
                        SHA-256: {report.checksumSha256.slice(0, 16)}...
                      </span>

                      {!isRevoked ? (
                        <a
                          href={`/api/reports/${report.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>{locale === 'ne' ? 'रिपोर्ट डाउनलोड (PDF)' : 'Download Report (PDF)'}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-rose-700 font-semibold italic">
                          {locale === 'ne' ? 'डाउनलोड अनुपलब्ध' : 'Download Withdrawn'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PAST HISTORY */}
      {activeTab === 'past' && (
        <div className="space-y-4">
          {pastAppointments.length === 0 && pastLabs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
              No historical or archived bookings yet.
            </div>
          ) : (
            <div className="space-y-3">
              {pastAppointments.map((apt) => (
                <div key={apt.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{apt.referenceNo}</span>
                      {getStatusBadge(apt.status)}
                    </div>
                    <p className="text-slate-600 mt-1">{apt.doctorNameSnapshot} • {new Date(apt.startTime).toLocaleDateString()}</p>
                  </div>
                  <span className="font-bold text-slate-700">NPR {apt.feeSnapshot}</span>
                </div>
              ))}
              {pastLabs.map((lab) => (
                <div key={lab.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{lab.referenceNo}</span>
                      {getStatusBadge(lab.status)}
                    </div>
                    <p className="text-slate-600 mt-1">Laboratory Booking • {new Date(lab.preferredTime).toLocaleDateString()}</p>
                  </div>
                  <span className="font-bold text-slate-700">NPR {lab.estimatedTotal}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PATIENT PROFILES (SELF & FAMILY) */}
      {activeTab === 'profiles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{t.tabProfiles}</h3>
              <p className="text-xs text-slate-500">
                Manage individuals who receive clinical care under this account. Maximum 6 profiles.
              </p>
            </div>
            {profiles.length < 6 && (
              <button
                type="button"
                onClick={() => setShowAddProfileModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 px-4 py-2 text-xs font-semibold text-white shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>{t.addFamilyMember}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profiles.map((p) => (
              <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{p.fullName}</h4>
                      <p className="text-[11px] text-teal-800 font-semibold capitalize">{p.relationshipLabel}</p>
                    </div>
                  </div>
                  {p.identityVerifiedAt ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      ID Verified
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      Self
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                  {p.dob && <p>DOB: {p.dob}</p>}
                  {p.sex && <p>Sex: {p.sex}</p>}
                  {p.phone && <p>Phone: {p.phone}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
