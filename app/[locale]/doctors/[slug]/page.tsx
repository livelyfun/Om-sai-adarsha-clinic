import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getMessages, Locale } from '@/lib/i18n';
import { Stethoscope, Calendar, Clock, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DoctorDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_NE = ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'];

export default async function DoctorDetailPage({ params }: DoctorDetailPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const slug = resolvedParams.slug;
  const messages = getMessages(locale);
  const common = messages.common;

  const doctor = db.getDoctorBySlug(slug);
  if (!doctor || !doctor.isActive) {
    notFound();
  }

  const schedules = db.getDoctorSchedules(doctor.id);

  const name = locale === 'ne' && doctor.nameNe ? doctor.nameNe : doctor.nameEn;
  const specialty = locale === 'ne' && doctor.specialtyNe ? doctor.specialtyNe : doctor.specialtyEn;
  const qualifications = locale === 'ne' && doctor.qualificationsNe ? doctor.qualificationsNe : doctor.qualificationsEn;
  const bio = locale === 'ne' && doctor.bioNe ? doctor.bioNe : doctor.bioEn;
  const isMissingNepali = locale === 'ne' && (!doctor.nameNe || !doctor.specialtyNe);

  // Schema.org Physician JSON-LD
  const clinicName = db.getSetting('clinic_name') || 'Om Sai Aadarsha Clinic';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: doctor.nameEn,
    medicalSpecialty: doctor.specialtyEn,
    hospitalAffiliation: {
      '@type': 'MedicalClinic',
      name: clinicName,
    },
    priceRange: `NPR ${doctor.consultationFee}`,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href={`/${locale}/doctors`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{locale === 'ne' ? 'सबै चिकित्सकहरूमा फर्कनुहोस्' : 'Back to Doctor Directory'}</span>
      </Link>

      {/* Profile Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-5">
            <div className="h-20 w-20 rounded-2xl bg-teal-50 border border-teal-100 text-teal-800 flex items-center justify-center font-bold text-3xl shrink-0">
              <Stethoscope className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {name}
              </h1>
              <p className="text-sm font-semibold text-teal-800">{specialty}</p>
              {qualifications && <p className="text-xs text-slate-500">{qualifications}</p>}
            </div>
          </div>

          <div className="w-full sm:w-auto text-left sm:text-right pt-2 sm:pt-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Consultation Fee
            </span>
            <span className="text-xl font-bold text-slate-900 block mt-0.5">
              NPR {doctor.consultationFee}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {doctor.slotDurationMinutes} min duration
            </span>
          </div>
        </div>

        {/* Translation fallback notice */}
        {isMissingNepali && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 leading-relaxed">
            {common.nepaliMissingNote}
          </div>
        )}

        {/* Biography */}
        {bio && (
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900">
              {locale === 'ne' ? 'अनुभव तथा परिचय' : 'Professional Background & Experience'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {bio}
            </p>
          </div>
        )}

        {/* Weekly Consultation Schedule */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-800" />
            <h3 className="font-bold text-sm text-slate-900">
              {locale === 'ne' ? 'साप्ताहिक परामर्श समय' : 'Weekly Consultation Hours'}
            </h3>
          </div>

          {schedules.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              {locale === 'ne' ? 'नियमित समयतालिका चाँडै अपडेट हुनेछ।' : 'Schedule updates in progress with front desk.'}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {DAYS.map((dayName, idx) => {
                const s = schedules.find((sched) => sched.dayOfWeek === idx);
                const dayLabel = locale === 'ne' ? DAYS_NE[idx] : dayName;

                const startH = s ? Math.floor(s.startTimeMinutes / 60) : 0;
                const startM = s ? s.startTimeMinutes % 60 : 0;
                const endH = s ? Math.floor(s.endTimeMinutes / 60) : 0;
                const endM = s ? s.endTimeMinutes % 60 : 0;

                const timeStr = s
                  ? `${startH > 12 ? startH - 12 : startH}:${String(startM).padStart(2, '0')} ${startH >= 12 ? 'PM' : 'AM'} – ${endH > 12 ? endH - 12 : endH}:${String(endM).padStart(2, '0')} ${endH >= 12 ? 'PM' : 'AM'}`
                  : (locale === 'ne' ? 'बिदा' : 'Off');

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs ${
                      s ? 'border-teal-200 bg-teal-50/50 text-slate-900' : 'border-slate-100 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <span className="font-bold block text-slate-800">{dayLabel}</span>
                    <span className="text-[11px] block mt-0.5">{timeStr}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500 max-w-sm">
            {messages.booking.requestNotice}
          </p>

          <Link
            href={`/${locale}/book?doctor=${doctor.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-800 hover:bg-teal-900 px-6 py-3 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <Calendar className="h-4 w-4" />
            <span>{locale === 'ne' ? 'अपोइन्टमेन्ट अनुरोध गर्नुहोस्' : 'Request Appointment'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
