import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getMessages, Locale } from '@/lib/i18n';
import { isDemoPlaceholderName } from '@/lib/utils';
import {
  Stethoscope,
  Calendar,
  Clock,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Phone,
  BadgeCheck,
  Users,
} from 'lucide-react';

interface DoctorDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_NE = ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'];

function initialsOf(name: string) {
  return name
    .replace(/^(dr\.?|prof\.?)\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default async function DoctorDetailPage({ params }: DoctorDetailPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const slug = resolvedParams.slug;
  const messages = getMessages(locale);
  const common = messages.common;

  const doctor = db.getDoctorBySlug(slug);
  if (!doctor || !doctor.isActive || isDemoPlaceholderName(doctor.nameEn)) {
    notFound();
  }

  const schedules = db.getDoctorSchedules(doctor.id);

  const name = locale === 'ne' && doctor.nameNe ? doctor.nameNe : doctor.nameEn;
  const specialty =
    locale === 'ne' && doctor.specialtyNe ? doctor.specialtyNe : doctor.specialtyEn;
  const qualifications =
    locale === 'ne' && doctor.qualificationsNe ? doctor.qualificationsNe : doctor.qualificationsEn;
  const bio = locale === 'ne' && doctor.bioNe ? doctor.bioNe : doctor.bioEn;
  const isMissingNepali = locale === 'ne' && (!doctor.nameNe || !doctor.specialtyNe);
  const phone = db.getSetting('phone') || '+977 9800000000';

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
    <div className="bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="border-b border-brand-950/8 bg-white">
        <div className="container-x py-4">
          <Link
            href={`/${locale}/doctors`}
            className="inline-flex min-h-9 items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate-500 transition-colors hover:text-brand-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {locale === 'ne' ? 'चिकित्सक सूचीमा फर्कनुहोस्' : 'Back to doctors'}
          </Link>
        </div>
      </div>

      <div className="container-x max-w-5xl py-10 sm:py-14">
        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
          <article className="card overflow-hidden">
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-800 to-brand-950 px-7 py-8 text-white sm:px-9">
              <div className="pointer-events-none absolute inset-0 bg-grid-light opacity-30" />
              <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-sand-400/15 blur-2xl" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border border-white/15 bg-white/10 font-display text-2xl font-semibold text-sand-200 backdrop-blur overflow-hidden">
                  {doctor.photoUrl ? (
                    <img
                      src={doctor.photoUrl}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initialsOf(name)
                  )}
                </span>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-brand-50">
                    <ShieldCheck className="h-3 w-3 text-sand-300" />
                    {locale === 'ne' ? 'प्रमाणित चिकित्सक' : 'Verified clinician'}
                  </span>
                  <h1 className="display-title mt-3 text-3xl text-white sm:text-4xl">{name}</h1>
                  <p className="mt-1.5 text-sm font-medium text-brand-100/85">{specialty}</p>
                  {qualifications && (
                    <p className="mt-0.5 text-[0.6875rem] text-brand-100/60">{qualifications}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 p-7 sm:p-9">
              {isMissingNepali && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                  {common.nepaliMissingNote}
                </p>
              )}

              {bio && (
                <div>
                  <h2 className="font-display text-sm font-semibold text-ink">
                    {locale === 'ne' ? 'अनुभव तथा परिचय' : 'Professional background'}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{bio}</p>
                </div>
              )}

              <div className="border-t border-brand-950/8 pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-700" />
                  <h2 className="font-display text-sm font-semibold text-ink">
                    {locale === 'ne' ? 'साप्ताहिक परामर्श समय' : 'Weekly consultation hours'}
                  </h2>
                </div>

                {schedules.length === 0 ? (
                  <p className="mt-3 text-xs italic text-slate-500">
                    {locale === 'ne'
                      ? 'नियमित समयतालिका चाँडै अद्यावधिक हुनेछ।'
                      : 'Schedule updates in progress with front desk.'}
                  </p>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {DAYS.map((dayName, idx) => {
                      const s = schedules.find((sched) => sched.dayOfWeek === idx);
                      const dayLabel = locale === 'ne' ? DAYS_NE[idx] : dayName;

                      const startH = s ? Math.floor(s.startTimeMinutes / 60) : 0;
                      const startM = s ? s.startTimeMinutes % 60 : 0;
                      const endH = s ? Math.floor(s.endTimeMinutes / 60) : 0;
                      const endM = s ? s.endTimeMinutes % 60 : 0;

                      const timeStr = s
                        ? `${startH > 12 ? startH - 12 : startH}:${String(startM).padStart(2, '0')} ${startH >= 12 ? 'PM' : 'AM'} – ${endH > 12 ? endH - 12 : endH}:${String(endM).padStart(2, '0')} ${endH >= 12 ? 'PM' : 'AM'}`
                        : locale === 'ne'
                          ? 'बिदा'
                          : 'Off';

                      return (
                        <div
                          key={idx}
                          className={
                            s
                              ? 'rounded-xl border border-brand-200 bg-brand-50/60 p-2.5 text-xs'
                              : 'rounded-xl border border-brand-950/8 bg-cream p-2.5 text-xs'
                          }
                        >
                          <span
                            className={
                              s
                                ? 'block font-semibold text-brand-900'
                                : 'block font-semibold text-slate-400'
                            }
                          >
                            {dayLabel}
                          </span>
                          <span
                            className={
                              s ? 'mt-0.5 block text-[0.6875rem] text-slate-700' : 'mt-0.5 block text-[0.6875rem] text-slate-400'
                            }
                          >
                            {timeStr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-brand-950/8 pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-sm text-[0.6875rem] leading-relaxed text-slate-500">
                    {messages.booking.requestNotice}
                  </p>
                  <Link
                    href={`/${locale}/book?doctor=${doctor.id}`}
                    className="btn btn-primary shrink-0 text-xs"
                  >
                    <Calendar className="h-4 w-4" />
                    {locale === 'ne' ? 'अपोइन्टमेन्ट अनुरोध' : 'Request appointment'}
                  </Link>
                </div>
              </div>
            </div>
          </article>

          <aside className="space-y-4">
            <div className="card p-6">
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                {locale === 'ne' ? 'परामर्श' : 'Consultation'}
              </span>
              <p className="display-title mt-3 text-3xl">NPR {doctor.consultationFee}</p>
              <p className="mt-2 flex items-center gap-1.5 text-[0.6875rem] text-slate-500">
                <Clock className="h-3.5 w-3.5 text-brand-600" />
                {doctor.slotDurationMinutes} {locale === 'ne' ? 'मिनेट' : 'minute slot'}
              </p>

              <div className="mt-5 space-y-2 border-t border-brand-950/8 pt-4 text-[0.6875rem] text-slate-600">
                <p className="flex items-center gap-2">
                  <BadgeCheck className="h-3.5 w-3.5 text-brand-600" />
                  {locale === 'ne' ? 'नेपाल मेडिकल काउन्सिल दर्ता' : 'NMC registered'}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-brand-600" />
                  {locale === 'ne' ? 'पारिवारिक प्रोफाइल समर्थित' : 'Family profiles supported'}
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />
                  {locale === 'ne' ? 'अनुरोधमा आधारित समय' : 'Request-based scheduling'}
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-brand-950 p-6 text-white">
              <div className="pointer-events-none absolute inset-0 bg-grid-light opacity-25" />
              <div className="relative">
                <Phone className="h-5 w-5 text-sand-300" />
                <p className="mt-3 font-display text-sm font-semibold">
                  {locale === 'ne' ? 'अन्य समय चाहिन्छ?' : 'Need another time?'}
                </p>
                <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-brand-100/70">
                  {locale === 'ne'
                    ? 'रिसेप्सनलाई फोन गर्नुहोस् — हामी मिलाउने प्रयास गर्नेछौं।'
                    : 'Call reception and we will do our best to find a slot.'}
                </p>
                <a
                  href={`tel:${phone}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-sand-300 hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {phone}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
