import React from 'react';
import Link from 'next/link';
import { requirePatientAuth } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { getMessages, Locale } from '@/lib/i18n';
import { Calendar, ShieldAlert, Info } from 'lucide-react';
import PatientDashboardClient from '@/components/portal/PatientDashboardClient';
import PatientSignOutButton from '@/components/portal/PatientSignOutButton';

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PatientDashboardPage({ params }: DashboardPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);
  const common = messages.common;
  const t = messages.dashboard;
  const bookingMessages = messages.booking;

  // Enforce server-side patient authentication
  const auth = await requirePatientAuth(false, locale);
  const patient = auth.user;

  // Load profiles owned by this patient account
  const profiles = db.getPatientProfilesByUser(patient.id);
  const profileIds = profiles.map(p => p.id);

  // Load bookings strictly by owned profile IDs
  const appointments = db.getAppointmentsByProfileIds(profileIds);
  const labBookings = db.getLabBookingsByProfileIds(profileIds);
  const labReports = db.getLabReportsByProfileIds(profileIds);

  const isVerified = Boolean(patient.emailVerifiedAt);

  return (
    <div className="bg-cream">
      <div className="container-x max-w-7xl space-y-7 py-10 sm:py-12">
        {/* Header bar */}
        <div className="flex flex-col gap-4 border-b border-brand-950/8 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {t.title}
            </span>
            <h1 className="display-title mt-2 text-3xl sm:text-[2.25rem]">
              {locale === 'ne' ? 'स्वागत छ, ' : 'Welcome, '}
              {profiles[0]?.fullName || patient.email}
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">{t.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href={`/${locale}/book`} className="btn btn-primary text-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span>{common.bookSession}</span>
            </Link>
            <PatientSignOutButton locale={locale} label={common.signOut} />
          </div>
        </div>

        {/* Unverified Email Warning Banner */}
        {!isVerified && (
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" />
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  {locale === 'ne' ? 'इमेल प्रमाणीकरण बाँकी छ' : 'Email Address Not Verified'}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-amber-900">
                  {messages.auth.emailNotVerified}
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/portal/verify`}
              className="shrink-0 rounded-full bg-amber-200/80 px-3.5 py-2 text-xs font-bold text-amber-950 transition-colors hover:bg-amber-300"
            >
              {messages.auth.resendVerification}
            </Link>
          </div>
        )}

        {/* Booking Request Rules Notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50/80 p-4 text-xs text-brand-900 sm:text-sm">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
          <p className="leading-relaxed">{bookingMessages.requestNotice}</p>
        </div>

        {/* Interactive Client Dashboard Component */}
        <PatientDashboardClient
          locale={locale}
          messages={messages}
          user={patient}
          profiles={profiles}
          appointments={appointments}
          labBookings={labBookings}
          reports={labReports}
        />
      </div>
    </div>
  );
}
