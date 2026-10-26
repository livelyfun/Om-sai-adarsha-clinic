'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { getMessages, Locale } from '@/lib/i18n';
import {
  Calendar,
  Stethoscope,
  FlaskConical,
  Activity,
  Info,
  ArrowRight,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  Users,
} from 'lucide-react';
import { Doctor, MedicalService, LabTest, PatientProfile } from '@/lib/db/types';

export default function BookingHubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const messages = getMessages(locale);
  const common = messages.common;
  const bookingMessages = messages.booking;

  const preselectedDoctorId = searchParams.get('doctor') || '';
  const preselectedServiceId = searchParams.get('service') || '';
  const preselectedTestId = searchParams.get('test') || '';

  const [activeTab, setActiveTab] = useState<'doctor' | 'lab' | 'service'>(
    preselectedTestId ? 'lab' : preselectedServiceId ? 'service' : 'doctor'
  );

  // User and profiles
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<PatientProfile[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Catalogues
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<MedicalService[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);

  // Form states
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(preselectedDoctorId);
  const [selectedServiceId, setSelectedServiceId] = useState(preselectedServiceId);
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>(preselectedTestId ? [preselectedTestId] : []);
  const [preferredDate, setPreferredDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [preferredTime, setPreferredTime] = useState('09:30');
  const [patientNotes, setPatientNotes] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadBookingDependencies() {
      try {
        // 1. Fetch user profiles
        const profileRes = await fetch('/api/portal/profiles');
        if (profileRes.ok) {
          const data = await profileRes.json();
          if (active) {
            setProfiles(data.profiles || []);
            if (data.profiles && data.profiles.length > 0) {
              setSelectedProfileId(data.profiles[0].id);
            }
            setCurrentUser({ loggedIn: true });
          }
        } else {
          if (active) setCurrentUser(null);
        }

        // 2. Fetch published catalogues
        const [docRes, servRes, testRes] = await Promise.all([
          fetch('/api/cms/doctors'),
          fetch('/api/cms/services'),
          fetch('/api/cms/lab-tests'),
        ]);

        const docData = await docRes.json();
        const servData = await servRes.json();
        const testData = await testRes.json();

        if (active) {
          if (docData.doctors) setDoctors(docData.doctors.filter((d: any) => d.isActive));
          if (servData.services) setServices(servData.services.filter((s: any) => s.isActive && s.bookingMode === 'request'));
          if (testData.tests) setLabTests(testData.tests.filter((t: any) => t.isActive));
        }
      } catch (err) {
        console.error('Failed to load booking dependencies:', err);
      } finally {
        if (active) {
          setLoadingAuth(false);
        }
      }
    }

    loadBookingDependencies();

    return () => {
      active = false;
    };
  }, []);

  function toggleTestSelection(id: string) {
    if (selectedTestIds.includes(id)) {
      setSelectedTestIds(selectedTestIds.filter(t => t !== id));
    } else {
      setSelectedTestIds([...selectedTestIds, id]);
    }
  }

  async function handleDoctorOrServiceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) {
      router.push(`/${locale}/portal/login`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSubmissionSuccess(null);

    try {
      const payload: any = {
        profileId: selectedProfileId,
        preferredDate,
        preferredTime,
        patientNotes,
      };

      if (activeTab === 'doctor') {
        payload.doctorId = selectedDoctorId || (doctors[0]?.id);
      } else {
        payload.serviceId = selectedServiceId || (services[0]?.id);
      }

      const res = await fetch('/api/bookings/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit booking request');
      }

      setSubmissionSuccess({
        type: activeTab,
        referenceNo: data.appointment.referenceNo,
        time: data.appointment.startTime,
        doctorOrService: data.appointment.doctorNameSnapshot,
        fee: data.appointment.feeSnapshot,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLabSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) {
      router.push(`/${locale}/portal/login`);
      return;
    }

    if (selectedTestIds.length === 0) {
      setErrorMessage(locale === 'ne' ? 'कृपया कम्तीमा एउटा ल्याब परीक्षण छान्नुहोस्।' : 'Please select at least one lab test.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSubmissionSuccess(null);

    try {
      const res = await fetch('/api/bookings/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: selectedProfileId,
          testIds: selectedTestIds,
          preferredDate,
          preferredTime,
          patientNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit lab request');
      }

      setSubmissionSuccess({
        type: 'lab',
        referenceNo: data.booking.referenceNo,
        time: data.booking.preferredTime,
        itemsCount: data.booking.itemsCount,
        estimatedTotal: data.booking.estimatedTotal,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Estimated Lab Total
  const estimatedLabTotal = selectedTestIds.reduce((sum, id) => {
    const t = labTests.find(item => item.id === id);
    return sum + (typeof t?.price === 'number' ? t.price : 0);
  }, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
          {locale === 'ne' ? 'अनलाइन सेवा अनुरोध' : 'Patient Request Hub'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          {common.bookSession}
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          {locale === 'ne'
            ? 'अनलाइन फारम पेश गर्दा बुकिङ अनुरोध दर्ता हुन्छ। क्लिनिक रिसेप्सनले समीक्षा गरी स्वीकृत गर्दछ।'
            : 'Select care domain and submit your requested date and slot. Our reception reviews and confirms every request.'}
        </p>
      </div>

      {/* Critical Request Notice Banner (Section 2 & 7) */}
      <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4.5 flex items-start gap-3.5 text-xs sm:text-sm text-teal-950 shadow-xs">
        <Info className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">{locale === 'ne' ? 'अनुरोधमा आधारित बुकिङ सम्बन्धी जानकारी' : 'Notice on Request-Based Bookings'}</p>
          <p className="text-xs text-teal-900 mt-0.5 leading-relaxed">
            {bookingMessages.requestNotice}
          </p>
        </div>
      </div>

      {/* Sign-in Reminder if Guest */}
      {!currentUser && !loadingAuth && (
        <div className="rounded-2xl bg-slate-900 text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-white">{locale === 'ne' ? 'बुकिङ पेश गर्न खाता आवश्यक' : 'Sign in to submit your request'}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {locale === 'ne' ? 'अनलाइन अनुरोध पेश गर्न र स्थिति ट्र्याक गर्न पहिले लगइन वा दर्ता गर्नुहोस्।' : 'Patient account required to submit requests, verify identity, and access lab reports.'}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/${locale}/portal/login`}
              className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500"
            >
              {messages.auth.patientSignIn}
            </Link>
            <Link
              href={`/${locale}/portal/register`}
              className="rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-300"
            >
              {locale === 'ne' ? 'नयाँ दर्ता' : 'Register'}
            </Link>
          </div>
        </div>
      )}

      {/* Success Modal / Banner */}
      {submissionSuccess && (
        <div className="rounded-2xl border-2 border-teal-700 bg-white p-8 shadow-xl text-center space-y-5 animate-in fade-in-50 zoom-in-95">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
            <CheckCircle2 className="h-10 w-10 text-teal-700" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              {locale === 'ne' ? 'अनुरोध प्राप्त भयो' : 'Request Received Successfully'}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">
              {locale === 'ne' ? 'बुकिङ अनुरोध दर्ता भयो' : 'Your Request Has Been Submitted'}
            </h2>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">{bookingMessages.referenceLabel}:</span>
              <span className="font-mono font-bold text-teal-900 text-sm">{submissionSuccess.referenceNo}</span>
            </div>
            {submissionSuccess.doctorOrService && (
              <div className="flex justify-between">
                <span className="text-slate-500">Provider / Service:</span>
                <span className="font-semibold text-slate-800">{submissionSuccess.doctorOrService}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Requested Time:</span>
              <span className="font-semibold text-slate-800">{new Date(submissionSuccess.time).toLocaleDateString()} at {new Date(submissionSuccess.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                {bookingMessages.statusPending}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            {locale === 'ne'
              ? 'हाम्रो रिसेप्सनले छिट्टै तपाईंको अनुरोध समीक्षा गर्नेछ। स्थिति हेर्न कृपया आफ्नो बिरामी पोर्टल जाँच गर्नुहोस्।'
              : 'Our reception team will review slot availability and update your request. Check your portal for confirmed status or reschedule proposals.'}
          </p>

          <div className="pt-2 flex justify-center gap-4">
            <Link
              href={`/${locale}/portal/dashboard`}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-6 py-2.5 text-xs font-semibold text-white hover:bg-teal-900"
            >
              <span>{locale === 'ne' ? 'मेरो ड्यासबोर्डमा जानुहोस्' : 'View in Patient Dashboard'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Booking Mode Tabs */}
      {!submissionSuccess && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('doctor')}
              className={`py-4 px-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'doctor'
                  ? 'border-teal-700 bg-white text-teal-900'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Stethoscope className="h-4 w-4 text-teal-700" />
              <span>{locale === 'ne' ? 'चिकित्सक परामर्श' : 'Doctor Consultation'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lab')}
              className={`py-4 px-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'lab'
                  ? 'border-teal-700 bg-white text-teal-900'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <FlaskConical className="h-4 w-4 text-cyan-700" />
              <span>{locale === 'ne' ? 'ल्याब परीक्षणहरू' : 'Laboratory Tests'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('service')}
              className={`py-4 px-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'service'
                  ? 'border-teal-700 bg-white text-teal-900'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Activity className="h-4 w-4 text-emerald-700" />
              <span>{locale === 'ne' ? 'अन्य स्वास्थ्य सेवा' : 'Clinical Services'}</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {errorMessage && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Profile Selection Row */}
            <div className="mb-6 pb-6 border-b border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                {bookingMessages.selectProfile} *
              </label>
              {profiles.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  {currentUser ? 'Loading your patient profiles...' : 'Sign in to select a patient profile.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {profiles.map((p) => (
                    <label
                      key={p.id}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between ${
                        selectedProfileId === p.id
                          ? 'border-teal-700 bg-teal-50/60 font-semibold text-teal-950'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div>
                        <span className="block font-bold">{p.fullName}</span>
                        <span className="text-[10px] text-slate-500 capitalize">{p.relationshipLabel}</span>
                      </div>
                      <input
                        type="radio"
                        name="patientProfile"
                        checked={selectedProfileId === p.id}
                        onChange={() => setSelectedProfileId(p.id)}
                        className="text-teal-800"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* TAB 1: DOCTOR APPOINTMENT */}
            {activeTab === 'doctor' && (
              <form onSubmit={handleDoctorOrServiceSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    {locale === 'ne' ? 'चिकित्सक छनोट गर्नुहोस्' : 'Select Specialist Physician'} *
                  </label>
                  {doctors.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No doctors currently published.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {doctors.map((doc) => {
                        const isSelected = selectedDoctorId === doc.id || (!selectedDoctorId && doc.id === doctors[0]?.id);
                        return (
                          <label
                            key={doc.id}
                            className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between ${
                              isSelected ? 'border-teal-700 bg-teal-50/60 font-semibold' : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Stethoscope className="h-5 w-5 text-teal-700" />
                              <div>
                                <p className="font-bold text-slate-900">{locale === 'ne' && doc.nameNe ? doc.nameNe : doc.nameEn}</p>
                                <p className="text-[11px] text-teal-800 font-medium">{doc.specialtyEn} • NPR {doc.consultationFee}</p>
                              </div>
                            </div>
                            <input
                              type="radio"
                              name="doctor"
                              checked={isSelected}
                              onChange={() => setSelectedDoctorId(doc.id)}
                              className="text-teal-800"
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Date & Time Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      {bookingMessages.preferredDate} *
                    </label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      {bookingMessages.preferredTime} *
                    </label>
                    <input
                      type="time"
                      required
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900"
                    />
                  </div>
                </div>

                {/* Patient Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    {bookingMessages.patientNote}
                  </label>
                  <textarea
                    rows={2}
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    placeholder={bookingMessages.patientNotePlaceholder}
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-800 hover:bg-teal-900 py-3.5 px-4 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? common.loading : (locale === 'ne' ? 'अपोइन्टमेन्ट अनुरोध पेश गर्नुहोस्' : 'Submit Consultation Request')}
                  {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            )}

            {/* TAB 2: LAB DIAGNOSTICS */}
            {activeTab === 'lab' && (
              <form onSubmit={handleLabSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    {locale === 'ne' ? 'परीक्षणहरू छान्नुहोस् (एक वा बढी)' : 'Select Diagnostic Investigations (Multiple Allowed)'} *
                  </label>
                  {labTests.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No lab tests published yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                      {labTests.map((t) => {
                        const isChecked = selectedTestIds.includes(t.id);
                        return (
                          <label
                            key={t.id}
                            className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start justify-between gap-2 ${
                              isChecked ? 'border-cyan-700 bg-cyan-50/60 font-semibold' : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900">{locale === 'ne' && t.nameNe ? t.nameNe : t.nameEn}</p>
                              <p className="text-[11px] text-slate-600">
                                {t.price !== null ? `NPR ${t.price}` : 'Price confirmed by clinic'}
                              </p>
                              {t.prepInstructionsEn && (
                                <p className="text-[10px] text-slate-500 line-clamp-1 italic">
                                  Prep: {t.prepInstructionsEn}
                                </p>
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleTestSelection(t.id)}
                              className="mt-1 text-cyan-800"
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Estimated Total */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">Selected Tests: {selectedTestIds.length}</span>
                    <p className="text-[11px] text-slate-500">Prices are estimates. Final billing settled at clinic counter.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Estimated Total</span>
                    <span className="font-bold text-slate-900 text-sm">NPR {estimatedLabTotal}</span>
                  </div>
                </div>

                {/* Preferred Visit Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      {bookingMessages.preferredDate} *
                    </label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      {bookingMessages.preferredTime} *
                    </label>
                    <input
                      type="time"
                      required
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    {bookingMessages.patientNote}
                  </label>
                  <textarea
                    rows={2}
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    placeholder="Doctor prescription notes or specific requests..."
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || selectedTestIds.length === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-800 hover:bg-cyan-900 py-3.5 px-4 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? common.loading : (locale === 'ne' ? 'ल्याब बुकिङ अनुरोध पेश गर्नुहोस्' : 'Submit Lab Investigation Request')}
                  {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            )}

            {/* TAB 3: MEDICAL SERVICES */}
            {activeTab === 'service' && (
              <form onSubmit={handleDoctorOrServiceSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    {locale === 'ne' ? 'सेवा छनोट गर्नुहोस्' : 'Select Outpatient Medical Service'} *
                  </label>
                  {services.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No bookable services published.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {services.map((s) => {
                        const isSelected = selectedServiceId === s.id || (!selectedServiceId && s.id === services[0]?.id);
                        return (
                          <label
                            key={s.id}
                            className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between ${
                              isSelected ? 'border-emerald-700 bg-emerald-50/60 font-semibold' : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Activity className="h-5 w-5 text-emerald-700" />
                              <div>
                                <p className="font-bold text-slate-900">{locale === 'ne' && s.nameNe ? s.nameNe : s.nameEn}</p>
                                <p className="text-[11px] text-emerald-800 font-medium">NPR {s.fee}</p>
                              </div>
                            </div>
                            <input
                              type="radio"
                              name="service"
                              checked={isSelected}
                              onChange={() => setSelectedServiceId(s.id)}
                              className="text-emerald-800"
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      {bookingMessages.preferredDate} *
                    </label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      {bookingMessages.preferredTime} *
                    </label>
                    <input
                      type="time"
                      required
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    {bookingMessages.patientNote}
                  </label>
                  <textarea
                    rows={2}
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    placeholder="Specific symptoms or clinical queries..."
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 py-3.5 px-4 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? common.loading : (locale === 'ne' ? 'सेवा अनुरोध पेश गर्नुहोस्' : 'Submit Service Request')}
                  {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
