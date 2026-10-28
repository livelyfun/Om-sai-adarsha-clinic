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
  Users,
} from 'lucide-react';
import { Doctor, MedicalService, LabTest, PatientProfile } from '@/lib/db/types';
import { uniqueBy } from '@/lib/utils';
import PageHeader from '@/components/public/PageHeader';

const labelClass =
  'mb-2 block text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate-500';

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

        // 2. Fetch the public catalogue (active, de-duplicated records)
        const catalogueRes = await fetch('/api/public/catalogue');
        const catalogue = catalogueRes.ok ? await catalogueRes.json() : {};

        if (active) {
          setDoctors(uniqueBy(catalogue.doctors || [], (d: any) => d.nameEn));
          setServices(
            (catalogue.services || []).filter((s: any) => s.isActive && s.bookingMode === 'request')
          );
          setLabTests((catalogue.labTests || []).filter((t: any) => t.isActive));
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
      setSelectedTestIds(selectedTestIds.filter((t) => t !== id));
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
        payload.doctorId = selectedDoctorId || doctors[0]?.id;
      } else {
        payload.serviceId = selectedServiceId || services[0]?.id;
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
      setErrorMessage(
        locale === 'ne' ? 'कृपया कम्तीमा एउटा ल्याब परीक्षण छान्नुहोस्।' : 'Please select at least one lab test.'
      );
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
    const t = labTests.find((item) => item.id === id);
    return sum + (typeof t?.price === 'number' ? t.price : 0);
  }, 0);

  const tabs = [
    {
      id: 'doctor' as const,
      icon: Stethoscope,
      label: locale === 'ne' ? 'चिकित्सक' : 'Doctor',
    },
    {
      id: 'lab' as const,
      icon: FlaskConical,
      label: locale === 'ne' ? 'ल्याब' : 'Lab tests',
    },
    {
      id: 'service' as const,
      icon: Activity,
      label: locale === 'ne' ? 'अन्य सेवा' : 'Services',
    },
  ];

  return (
    <div className="bg-cream">
      <PageHeader
        eyebrow={locale === 'ne' ? 'बिरामी अनुरोध केन्द्र' : 'Patient request hub'}
        title={common.bookSession}
        description={
          locale === 'ne'
            ? 'सेवा छान्नुहोस्, आफ्नो मनपर्ने मिति र समय पठाउनुहोस्। रिसेप्सनले हरेक अनुरोध समीक्षा गरी पुष्टि गर्छ।'
            : 'Choose a care type and send your preferred date and time. Reception reviews and confirms every request.'
        }
      />

      <div className="container-x grid grid-cols-1 gap-6 py-8 sm:gap-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <div className="min-w-0 space-y-5">
          {/* Request notice */}
          <div className="flex items-start gap-3.5 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-brand-950">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
            <div>
              <p className="text-[0.8125rem] font-semibold">
                {locale === 'ne' ? 'अनुरोधमा आधारित बुकिङ' : 'Request-based booking'}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-brand-900/80">
                {bookingMessages.requestNotice}
              </p>
            </div>
          </div>

          {/* Guest sign-in */}
          {!currentUser && !loadingAuth && (
            <div className="relative overflow-hidden rounded-2xl bg-brand-950 p-6 text-white">
              <div className="pointer-events-none absolute inset-0 bg-grid-light opacity-25" />
              <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-display text-sm font-semibold">
                    {locale === 'ne' ? 'बुकिङ पेश गर्न खाता आवश्यक' : 'Sign in to submit your request'}
                  </h3>
                  <p className="mt-1 max-w-md text-xs leading-relaxed text-brand-100/70">
                    {locale === 'ne'
                      ? 'अनलाइन अनुरोध पेश गर्न र स्थिति ट्र्याक गर्न पहिले लगइन वा दर्ता गर्नुहोस्।'
                      : 'A patient account is required to submit requests, verify identity and access lab reports.'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <Link href={`/${locale}/portal/login`} className="btn btn-accent !px-4 !py-2.5 text-xs">
                    {messages.auth.patientSignIn}
                  </Link>
                  <Link
                    href={`/${locale}/portal/register`}
                    className="rounded-full border border-white/20 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    {locale === 'ne' ? 'दर्ता' : 'Register'}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Success */}
          {submissionSuccess && (
            <div className="animate-fade-up rounded-[1.75rem] border border-brand-200 bg-white p-8 text-center shadow-soft">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <span className="eyebrow mt-6 justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                {locale === 'ne' ? 'अनुरोध प्राप्त भयो' : 'Request received'}
              </span>
              <h2 className="display-title mt-3 text-2xl sm:text-3xl">
                {locale === 'ne' ? 'बुकिङ अनुरोध दर्ता भयो' : 'Your request is in'}
              </h2>

              <div className="mx-auto mt-6 max-w-md space-y-2.5 rounded-2xl border border-brand-950/8 bg-cream p-5 text-left text-xs">
                <div className="flex items-center justify-between border-b border-brand-950/8 pb-2.5">
                  <span className="text-slate-500">{bookingMessages.referenceLabel}</span>
                  <span className="font-mono text-sm font-bold text-brand-900">
                    {submissionSuccess.referenceNo}
                  </span>
                </div>
                {submissionSuccess.doctorOrService && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      {locale === 'ne' ? 'चिकित्सक / सेवा' : 'Provider / service'}
                    </span>
                    <span className="text-right font-semibold text-slate-800">
                      {submissionSuccess.doctorOrService}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">{locale === 'ne' ? 'अनुरोधित समय' : 'Requested time'}</span>
                  <span className="text-right font-semibold text-slate-800">
                    {new Date(submissionSuccess.time).toLocaleDateString()} ·{' '}
                    {new Date(submissionSuccess.time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{messages.common.status}</span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[0.625rem] font-bold text-amber-800">
                    {bookingMessages.statusPending}
                  </span>
                </div>
              </div>

              <p className="mx-auto mt-5 max-w-md text-xs leading-relaxed text-slate-600">
                {locale === 'ne'
                  ? 'रिसेप्सनले छिट्टै तपाईंको अनुरोध समीक्षा गर्नेछ। स्थिति हेर्न आफ्नो बिरामी पोर्टल जाँच गर्नुहोस्।'
                  : 'Our reception team will review slot availability and update your request. Check your portal for confirmed status or reschedule proposals.'}
              </p>

              <Link href={`/${locale}/portal/dashboard`} className="btn btn-primary mt-6">
                {locale === 'ne' ? 'ड्यासबोर्डमा जानुहोस्' : 'View in patient dashboard'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Form */}
          {!submissionSuccess && (
            <div className="overflow-hidden rounded-[1.75rem] border border-brand-950/8 bg-white shadow-soft">
              <div className="border-b border-brand-950/8 p-3">
                <div
                  role="tablist"
                  aria-label={locale === 'ne' ? 'बुकिङ प्रकार' : 'Booking type'}
                  className="grid grid-cols-3 gap-1 rounded-2xl bg-cream p-1"
                >
                  {tabs.map((tab) => {
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveTab(tab.id)}
                        className={
                          active
                            ? 'flex min-h-[2.5rem] items-center justify-center gap-1.5 rounded-xl bg-white py-2 text-[0.6875rem] font-semibold text-brand-900 shadow-sm sm:text-[0.75rem] sm:py-2.5'
                            : 'flex min-h-[2.5rem] items-center justify-center gap-1.5 rounded-xl py-2 text-[0.6875rem] font-medium text-slate-500 transition-colors hover:text-brand-800 sm:text-[0.75rem] sm:py-2.5'
                        }
                      >
                        <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {errorMessage && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Profile selection */}
                <div className="mb-6 border-b border-brand-950/8 pb-6">
                  <label className={labelClass}>{bookingMessages.selectProfile} *</label>
                  {profiles.length === 0 ? (
                    <p className="text-xs italic text-slate-500">
                      {locale === 'ne'
                        ? 'प्रोफाइल लोड हुँदैछ...'
                        : 'Sign in to select a patient profile.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {profiles.map((p) => (
                        <label
                          key={p.id}
                          className={
                            selectedProfileId === p.id
                              ? 'flex cursor-pointer items-center justify-between rounded-xl border border-brand-500 bg-brand-50/70 p-3 text-xs ring-1 ring-brand-500/20'
                              : 'flex cursor-pointer items-center justify-between rounded-xl border border-brand-950/10 p-3 text-xs transition-colors hover:border-brand-300'
                          }
                        >
                          <span>
                            <span className="block font-semibold text-ink">{p.fullName}</span>
                            <span className="mt-0.5 block text-[0.625rem] capitalize text-slate-500">
                              {p.relationshipLabel}
                            </span>
                          </span>
                          <input
                            type="radio"
                            name="patientProfile"
                            checked={selectedProfileId === p.id}
                            onChange={() => setSelectedProfileId(p.id)}
                            className="accent-brand-800"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* TAB 1: DOCTOR */}
                {activeTab === 'doctor' && (
                  <form onSubmit={handleDoctorOrServiceSubmit} className="space-y-6">
                    <div>
                      <label className={labelClass}>
                        {locale === 'ne' ? 'चिकित्सक छनोट गर्नुहोस्' : 'Select a specialist'} *
                      </label>
                      {loadingAuth ? (
                        <div className="flex items-center gap-2 rounded-xl bg-cream p-4 text-xs text-slate-500">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
                          {locale === 'ne' ? 'चिकित्सक लोड हुँदैछ…' : 'Loading specialists…'}
                        </div>
                      ) : doctors.length === 0 ? (
                        <p className="rounded-xl bg-cream p-4 text-xs italic text-slate-500">
                          {locale === 'ne' ? 'हाल कुनै चिकित्सक प्रकाशित छैनन्।' : 'No doctors currently published.'}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          {doctors.map((doc) => {
                            const isSelected =
                              selectedDoctorId === doc.id || (!selectedDoctorId && doc.id === doctors[0]?.id);
                            return (
                              <label
                                key={doc.id}
                                className={
                                  isSelected
                                    ? 'flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-brand-500 bg-brand-50/70 p-3.5 text-xs ring-1 ring-brand-500/20'
                                    : 'flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-brand-950/10 p-3.5 text-xs transition-colors hover:border-brand-300'
                                }
                              >
                                <span className="flex min-w-0 items-center gap-3">
                                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-brand-700 ring-1 ring-brand-950/5">
                                    <Stethoscope className="h-4 w-4" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block truncate font-semibold text-ink">
                                      {locale === 'ne' && doc.nameNe ? doc.nameNe : doc.nameEn}
                                    </span>
                                    <span className="mt-0.5 block text-[0.6875rem] text-brand-700">
                                      {doc.specialtyEn} · NPR {doc.consultationFee}
                                    </span>
                                  </span>
                                </span>
                                <input
                                  type="radio"
                                  name="doctor"
                                  checked={isSelected}
                                  onChange={() => setSelectedDoctorId(doc.id)}
                                  className="accent-brand-800"
                                />
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>{bookingMessages.preferredDate} *</label>
                        <input
                          type="date"
                          required
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="field"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{bookingMessages.preferredTime} *</label>
                        <input
                          type="time"
                          required
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          className="field"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>{bookingMessages.patientNote}</label>
                      <textarea
                        rows={3}
                        value={patientNotes}
                        onChange={(e) => setPatientNotes(e.target.value)}
                        placeholder={bookingMessages.patientNotePlaceholder}
                        className="field resize-none"
                      />
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full disabled:opacity-60">
                      {isSubmitting
                        ? common.loading
                        : locale === 'ne'
                          ? 'परामर्श अनुरोध पेश गर्नुहोस्'
                          : 'Submit consultation request'}
                      {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                    </button>
                  </form>
                )}

                {/* TAB 2: LAB */}
                {activeTab === 'lab' && (
                  <form onSubmit={handleLabSubmit} className="space-y-6">
                    <div>
                      <label className={labelClass}>
                        {locale === 'ne'
                          ? 'परीक्षणहरू छान्नुहोस् (एक वा बढी)'
                          : 'Select investigations (multiple allowed)'}{' '}
                        *
                      </label>
                      {loadingAuth ? (
                        <div className="flex items-center gap-2 rounded-xl bg-cream p-4 text-xs text-slate-500">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
                          {locale === 'ne' ? 'परीक्षण लोड हुँदैछ…' : 'Loading lab tests…'}
                        </div>
                      ) : labTests.length === 0 ? (
                        <p className="rounded-xl bg-cream p-4 text-xs italic text-slate-500">
                          {locale === 'ne' ? 'हाल कुनै परीक्षण प्रकाशित छैन।' : 'No lab tests published yet.'}
                        </p>
                      ) : (
                        <div className="grid max-h-72 grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
                          {labTests.map((t) => {
                            const isChecked = selectedTestIds.includes(t.id);
                            return (
                              <label
                                key={t.id}
                                className={
                                  isChecked
                                    ? 'flex cursor-pointer items-start justify-between gap-2 rounded-xl border border-brand-500 bg-brand-50/70 p-3 text-xs ring-1 ring-brand-500/20'
                                    : 'flex cursor-pointer items-start justify-between gap-2 rounded-xl border border-brand-950/10 p-3 text-xs transition-colors hover:border-brand-300'
                                }
                              >
                                <span className="space-y-0.5">
                                  <span className="block font-semibold text-ink">
                                    {locale === 'ne' && t.nameNe ? t.nameNe : t.nameEn}
                                  </span>
                                  <span className="block text-[0.6875rem] text-slate-600">
                                    {t.price !== null
                                      ? `NPR ${t.price}`
                                      : locale === 'ne'
                                        ? 'शुल्क पुष्टि हुने'
                                        : 'Price confirmed by clinic'}
                                  </span>
                                  {t.prepInstructionsEn && (
                                    <span className="line-clamp-1 block text-[0.625rem] italic text-slate-500">
                                      {locale === 'ne' ? 'तयारी: ' : 'Prep: '}
                                      {locale === 'ne' && t.prepInstructionsNe
                                        ? t.prepInstructionsNe
                                        : t.prepInstructionsEn}
                                    </span>
                                  )}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleTestSelection(t.id)}
                                  className="mt-0.5 accent-brand-800"
                                />
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-950/8 bg-cream p-4 text-xs">
                      <div>
                        <span className="font-semibold text-ink">
                          {locale === 'ne'
                            ? `छानिएका परीक्षण: ${selectedTestIds.length}`
                            : `Selected tests: ${selectedTestIds.length}`}
                        </span>
                        <p className="mt-0.5 text-[0.625rem] text-slate-500">
                          {locale === 'ne'
                            ? 'शुल्क अनुमानित हो; अन्तिम बिल काउन्टरमा।'
                            : 'Prices are estimates. Final billing is settled at the counter.'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="block text-[0.5625rem] uppercase tracking-[0.1em] text-slate-400">
                          {locale === 'ne' ? 'अनुमानित जम्मा' : 'Estimated total'}
                        </span>
                        <span className="font-display text-sm font-semibold text-ink">
                          NPR {estimatedLabTotal}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>{bookingMessages.preferredDate} *</label>
                        <input
                          type="date"
                          required
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="field"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{bookingMessages.preferredTime} *</label>
                        <input
                          type="time"
                          required
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          className="field"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>{bookingMessages.patientNote}</label>
                      <textarea
                        rows={3}
                        value={patientNotes}
                        onChange={(e) => setPatientNotes(e.target.value)}
                        placeholder={
                          locale === 'ne'
                            ? 'चिकित्सकको पर्चा वा विशेष अनुरोध...'
                            : 'Doctor prescription notes or specific requests...'
                        }
                        className="field resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || selectedTestIds.length === 0}
                      className="btn btn-primary w-full disabled:opacity-60"
                    >
                      {isSubmitting
                        ? common.loading
                        : locale === 'ne'
                          ? 'ल्याब अनुरोध पेश गर्नुहोस्'
                          : 'Submit lab investigation request'}
                      {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                    </button>
                  </form>
                )}

                {/* TAB 3: SERVICES */}
                {activeTab === 'service' && (
                  <form onSubmit={handleDoctorOrServiceSubmit} className="space-y-6">
                    <div>
                      <label className={labelClass}>
                        {locale === 'ne' ? 'सेवा छनोट गर्नुहोस्' : 'Select an outpatient service'} *
                      </label>
                      {loadingAuth ? (
                        <div className="flex items-center gap-2 rounded-xl bg-cream p-4 text-xs text-slate-500">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
                          {locale === 'ne' ? 'सेवा लोड हुँदैछ…' : 'Loading services…'}
                        </div>
                      ) : services.length === 0 ? (
                        <p className="rounded-xl bg-cream p-4 text-xs italic text-slate-500">
                          {locale === 'ne' ? 'हाल कुनै सेवा प्रकाशित छैन।' : 'No bookable services published.'}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          {services.map((s) => {
                            const isSelected =
                              selectedServiceId === s.id || (!selectedServiceId && s.id === services[0]?.id);
                            return (
                              <label
                                key={s.id}
                                className={
                                  isSelected
                                    ? 'flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-brand-500 bg-brand-50/70 p-3.5 text-xs ring-1 ring-brand-500/20'
                                    : 'flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-brand-950/10 p-3.5 text-xs transition-colors hover:border-brand-300'
                                }
                              >
                                <span className="flex min-w-0 items-center gap-3">
                                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-brand-700 ring-1 ring-brand-950/5">
                                    <Activity className="h-4 w-4" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block truncate font-semibold text-ink">
                                      {locale === 'ne' && s.nameNe ? s.nameNe : s.nameEn}
                                    </span>
                                    <span className="mt-0.5 block text-[0.6875rem] text-brand-700">
                                      NPR {s.fee}
                                    </span>
                                  </span>
                                </span>
                                <input
                                  type="radio"
                                  name="service"
                                  checked={isSelected}
                                  onChange={() => setSelectedServiceId(s.id)}
                                  className="accent-brand-800"
                                />
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>{bookingMessages.preferredDate} *</label>
                        <input
                          type="date"
                          required
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="field"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{bookingMessages.preferredTime} *</label>
                        <input
                          type="time"
                          required
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          className="field"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>{bookingMessages.patientNote}</label>
                      <textarea
                        rows={3}
                        value={patientNotes}
                        onChange={(e) => setPatientNotes(e.target.value)}
                        placeholder={
                          locale === 'ne'
                            ? 'लक्षण वा विशेष जिज्ञासा...'
                            : 'Specific symptoms or clinical queries...'
                        }
                        className="field resize-none"
                      />
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full disabled:opacity-60">
                      {isSubmitting
                        ? common.loading
                        : locale === 'ne'
                          ? 'सेवा अनुरोध पेश गर्नुहोस्'
                          : 'Submit service request'}
                      {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Summary rail */}
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-28">
          <div className="rounded-3xl border border-brand-950/8 bg-white p-6 shadow-soft">
            <p className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {locale === 'ne' ? 'कसरी काम गर्छ' : 'How it works'}
            </p>
            <ol className="mt-5 space-y-4">
              {[
                {
                  icon: User,
                  title: locale === 'ne' ? 'प्रोफाइल छान्नुहोस्' : 'Choose a profile',
                  sub:
                    locale === 'ne'
                      ? 'आफ्नो वा परिवारको प्रोफाइल'
                      : 'Yourself or a family member',
                },
                {
                  icon: Calendar,
                  title: locale === 'ne' ? 'समय अनुरोध गर्नुहोस्' : 'Request a time',
                  sub:
                    locale === 'ne'
                      ? 'मनपर्ने मिति र समय'
                      : 'Your preferred date and time',
                },
                {
                  icon: ShieldCheck,
                  title: locale === 'ne' ? 'रिसेप्सनको पुष्टि' : 'Reception confirms',
                  sub:
                    locale === 'ne'
                      ? 'समीक्षा र अन्तिम समय'
                      : 'Review and final slot confirmation',
                },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <step.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-ink">
                      <span className="mr-1.5 font-mono text-[0.625rem] text-slate-400">0{index + 1}</span>
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-[0.625rem] leading-relaxed text-slate-500">{step.sub}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-3xl border border-brand-950/8 bg-white p-6">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Clock className="h-4 w-4" />
              </span>
              <p className="text-xs font-semibold text-ink">
                {locale === 'ne' ? 'क्लिनिक समय' : 'Clinic hours'}
              </p>
            </div>
            <p className="mt-3 text-[0.6875rem] leading-relaxed text-slate-600">
              {locale === 'ne'
                ? 'आइतबार – शुक्रबार, बिहान ७:०० – साँझ ८:००'
                : 'Sunday – Friday, 7:00 AM – 8:00 PM'}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-[0.625rem] text-slate-500">
              <Users className="h-3.5 w-3.5 text-brand-600" />
              {locale === 'ne' ? 'वॉक-इन पनि उपलब्ध' : 'Walk-ins also welcome'}
            </p>
          </div>

          <div className="rounded-3xl bg-brand-950 p-6 text-white">
            <FileText className="h-5 w-5 text-sand-300" />
            <p className="mt-3 font-display text-sm font-semibold">
              {locale === 'ne' ? 'रिपोर्ट पोर्टलमा' : 'Reports live in your portal'}
            </p>
            <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-brand-100/70">
              {locale === 'ne'
                ? 'ल्याब नतिजा प्रमाणीकरण भएपछि सुरक्षित रूपमा डाउनलोड गर्नुहोस्।'
                : 'Download authenticated lab results once they are released.'}
            </p>
            <Link
              href={`/${locale}/portal/login`}
              className="mt-4 inline-flex items-center gap-1.5 text-[0.6875rem] font-bold text-sand-300 hover:underline"
            >
              {locale === 'ne' ? 'पोर्टल खोल्नुहोस्' : 'Open patient portal'}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
