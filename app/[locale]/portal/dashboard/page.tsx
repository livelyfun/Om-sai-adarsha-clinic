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
  const auth = await requirePatientAuth(false);
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            {t.title}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif mt-1">
            {locale === 'ne' ? 'स्वागत छ, ' : 'Welcome, '} {profiles[0]?.fullName || patient.email}
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/book`}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 shadow-xs"
          >
            <Calendar className="h-4 w-4" />
            <span>{common.bookSession}</span>
          </Link>
          <PatientSignOutButton locale={locale} label={common.signOut} />
        </div>
      </div>

      {/* Unverified Email Warning Banner */}
      {!isVerified && (
        <div className="rounded-2xl bg-amber-50 border border-amber-300 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-6 w-6 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-950 text-sm">
                {locale === 'ne' ? 'इमेल प्रमाणीकरण बाँकी छ' : 'Email Address Not Verified'}
              </h3>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                {messages.auth.emailNotVerified}
              </p>
            </div>
          </div>
          <Link
            href={`/${locale}/portal/verify`}
            className="shrink-0 text-xs font-bold text-amber-950 bg-amber-200/80 hover:bg-amber-300 px-3.5 py-2 rounded-lg transition-colors"
          >
            {messages.auth.resendVerification}
          </Link>
        </div>
      )}

      {/* Booking Request Rules Notice */}
      <div className="rounded-xl bg-teal-50/80 border border-teal-200 p-4 flex items-start gap-3 text-xs sm:text-sm text-teal-900">
        <Info className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {bookingMessages.requestNotice}
        </p>
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
  );
}
