import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getMessages, Locale } from '@/lib/i18n';
import { uniqueBy, isDemoPlaceholderName } from '@/lib/utils';
import {
  Stethoscope,
  ArrowRight,
  Search,
  Users,
  ShieldCheck,
  CalendarCheck,
  Phone,
  Calendar,
} from 'lucide-react';
import PageHeader from '@/components/public/PageHeader';

interface DoctorsPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ q?: string }>;
}

function initialsOf(name: string) {
  return name
    .replace(/^(dr\.?|prof\.?)\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default async function DoctorsDirectoryPage({ params, searchParams }: DoctorsPageProps) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);
  const common = messages.common;
  const nav = messages.nav;

  const query = (resolvedSearch?.q || '').toLowerCase();
  const phone = db.getSetting('phone') || '+977 9800000000';
  const allActiveDoctors = uniqueBy(db.getDoctors(true), (doc) => doc.nameEn).filter(
    (doc) => !isDemoPlaceholderName(doc.nameEn)
  );

  const doctors = allActiveDoctors.filter((doc) => {
    if (!query) return true;
    const matchName = doc.nameEn.toLowerCase().includes(query) || (doc.nameNe && doc.nameNe.includes(query));
    const matchSpecialty =
      doc.specialtyEn.toLowerCase().includes(query) || (doc.specialtyNe && doc.specialtyNe.includes(query));
    return matchName || matchSpecialty;
  });

  return (
    <div className="bg-cream">
      <PageHeader
        eyebrow={locale === 'ne' ? 'ओपीडी परामर्श' : 'Outpatient consultations'}
        title={nav.doctors}
        description={
          locale === 'ne'
            ? 'क्लिनिकका योग्य तथा अनुभवी चिकित्सकहरूको सूची, परामर्श समयतालिका र शुल्क विवरण।'
            : 'Meet the clinicians you can consult, review their weekly schedules and request an appointment.'
        }
      >
        {allActiveDoctors.length > 0 && (
          <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3">
            <form method="GET" className="flex w-full items-center gap-2 rounded-full border border-brand-950/10 bg-white p-1.5 shadow-soft">
              <span className="pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder={
                  locale === 'ne'
                    ? 'चिकित्सक वा विशेषज्ञता खोज्नुहोस्...'
                    : 'Search by name or specialty...'
                }
                className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none"
              />
              <button type="submit" className="btn btn-primary !px-4 !py-2.5 text-xs">
                {locale === 'ne' ? 'खोज्नुहोस्' : 'Search'}
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              <Link
                href={`/${locale}/doctors`}
                className={`rounded-full px-3 py-1 text-[0.6875rem] font-semibold transition-all ${
                  !query
                    ? 'bg-brand-800 text-white shadow-xs'
                    : 'bg-white/80 text-slate-600 hover:bg-white hover:text-brand-900 border border-brand-950/10'
                }`}
              >
                {locale === 'ne' ? 'सबै विशेषज्ञ' : 'All Specialists'}
              </Link>
              {Array.from(
                new Set(
                  allActiveDoctors.map((d) =>
                    locale === 'ne' && d.specialtyNe ? d.specialtyNe : d.specialtyEn
                  )
                )
              )
                .slice(0, 5)
                .map((spec) => {
                  const isActive = query.toLowerCase() === spec.toLowerCase();
                  return (
                    <Link
                      key={spec}
                      href={`/${locale}/doctors?q=${encodeURIComponent(spec)}`}
                      className={`rounded-full px-3 py-1 text-[0.6875rem] font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-800 text-white shadow-xs'
                          : 'bg-white/80 text-slate-600 hover:bg-white hover:text-brand-900 border border-brand-950/10'
                      }`}
                    >
                      {spec}
                    </Link>
                  );
                })}
            </div>
          </div>
        )}
      </PageHeader>

      <div className="container-x py-12 sm:py-14">
        {allActiveDoctors.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-brand-950/15 bg-white px-8 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <Stethoscope className="h-7 w-7" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-ink">
              {locale === 'ne' ? 'चिकित्सक सूची अद्यावधिक हुँदैछ' : 'Doctor roster updating'}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
              {locale === 'ne'
                ? 'क्लिनिक प्रशासनद्वारा चिकित्सकहरूको प्रमाणित प्रोफाइल तथा साप्ताहिक समयतालिका चाँडै सार्वजनिक गरिनेछ।'
                : 'Doctor profiles and verified weekly consultation schedules are currently being updated by clinic administration.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {locale === 'ne'
                  ? `${doctors.length} चिकित्सक भेटिए`
                  : `${doctors.length} ${doctors.length === 1 ? 'specialist' : 'specialists'} available`}
              </p>
              {query && (
                <Link href={`/${locale}/doctors`} className="link-arrow">
                  {locale === 'ne' ? 'खोज हटाउनुहोस्' : 'Clear search'}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            {doctors.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-brand-950/15 bg-white px-8 py-14 text-center">
                <p className="font-display text-base font-semibold text-ink">
                  {locale === 'ne' ? 'कुनै नतिजा भेटिएन' : 'No matching doctors'}
                </p>
                <p className="mt-1.5 text-xs text-slate-500">
                  {locale === 'ne'
                    ? 'अर्को नाम वा विशेषज्ञता प्रयास गर्नुहोस्।'
                    : 'Try a different name or specialty.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {doctors.map((doc) => {
                  const name = locale === 'ne' && doc.nameNe ? doc.nameNe : doc.nameEn;
                  const specialty =
                    locale === 'ne' && doc.specialtyNe ? doc.specialtyNe : doc.specialtyEn;
                  const qualifications =
                    locale === 'ne' && doc.qualificationsNe
                      ? doc.qualificationsNe
                      : doc.qualificationsEn;
                  const isMissingNepali = locale === 'ne' && (!doc.nameNe || !doc.specialtyNe);
                  const bio = locale === 'ne' && doc.bioNe ? doc.bioNe : doc.bioEn;

                  return (
                    <article key={doc.id} className="group card card-hover flex flex-col overflow-hidden">
                      <div className="relative h-20 overflow-hidden bg-gradient-to-br from-brand-800 to-brand-950">
                        <div className="absolute inset-0 bg-grid-light opacity-40" />
                        <div className="absolute -right-4 -top-6 h-20 w-20 rounded-full bg-sand-400/15 blur-xl" />
                        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-brand-50 backdrop-blur">
                          <ShieldCheck className="h-3 w-3 text-sand-300" />
                          {locale === 'ne' ? 'प्रमाणित' : 'Verified'}
                        </span>
                      </div>

                      <div className="relative flex flex-1 flex-col px-5 pb-5">
                        <div className="-mt-7 flex items-end gap-3">
                          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-4 border-white bg-brand-50 font-display text-lg font-semibold text-brand-800 shadow-sm overflow-hidden">
                            {doc.photoUrl ? (
                              <img
                                src={doc.photoUrl}
                                alt={name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              initialsOf(name)
                            )}
                          </span>
                          <span className="pb-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-brand-600">
                            {specialty}
                          </span>
                        </div>

                        <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-ink">
                          {name}
                        </h3>
                        {qualifications && (
                          <p className="mt-0.5 text-[0.6875rem] text-slate-500">{qualifications}</p>
                        )}

                        {isMissingNepali && (
                          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[0.625rem] text-amber-800">
                            {common.nepaliMissingNote}
                          </p>
                        )}

                        <p className="mt-3 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-600">
                          {bio ||
                            (locale === 'ne'
                              ? 'क्लिनिकमा नियमित परामर्श उपलब्ध।'
                              : 'Available for outpatient consultations at the clinic.')}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-brand-950/8 pt-4">
                          <div>
                            <p className="text-[0.5625rem] uppercase tracking-[0.12em] text-slate-400">
                              {locale === 'ne' ? 'परामर्श शुल्क' : 'Consultation fee'}
                            </p>
                            <p className="font-display text-sm font-semibold text-ink">
                              NPR {doc.consultationFee}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/${locale}/doctors/${doc.slug}`}
                              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[0.6875rem] font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-900"
                            >
                              {locale === 'ne' ? 'समयतालिका' : 'Schedule'}
                            </Link>
                            <Link
                              href={`/${locale}/book?doctor=${doc.id}`}
                              className="inline-flex items-center gap-1 rounded-full bg-brand-800 px-3.5 py-1.5 text-[0.6875rem] font-bold text-white shadow-xs transition-all hover:bg-brand-900 hover:shadow-sm"
                            >
                              <Calendar className="h-3 w-3" />
                              {locale === 'ne' ? 'अपोइन्टमेन्ट' : 'Book'}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {doctors.length < 3 && (
                  <article
                    className={`relative flex flex-col justify-between overflow-hidden rounded-3xl bg-brand-950 p-6 text-white ${
                      doctors.length === 1 ? 'md:col-span-1 lg:col-span-2' : ''
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-grid-light opacity-25" />
                    <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-brand-600/30 blur-2xl" />
                    <div className="relative">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-sand-300">
                        <Phone className="h-5 w-5" />
                      </span>
                      <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">
                        {locale === 'ne' ? 'अर्को विशेषज्ञ चाहिन्छ?' : 'Looking for a different specialty?'}
                      </h3>
                      <p className="mt-2 max-w-sm text-[0.8125rem] leading-relaxed text-brand-100/75">
                        {locale === 'ne'
                          ? 'थप विशेषज्ञ परामर्श उपलब्ध हुन सक्छ। रिसेप्सनलाई फोन गर्नुहोस् वा अनुरोध पठाउनुहोस्।'
                          : 'Additional specialists may be available on request. Call reception or send a request and we will guide you.'}
                      </p>
                    </div>
                    <div className="relative mt-6 flex flex-wrap items-center gap-2.5">
                      <a href={`tel:${phone}`} className="btn btn-accent !px-4 !py-2.5 text-xs">
                        <Phone className="h-3.5 w-3.5" />
                        {phone}
                      </a>
                      <Link href={`/${locale}/book`} className="btn btn-outline-light !px-4 !py-2.5 text-xs">
                        <Calendar className="h-3.5 w-3.5" />
                        {common.bookSession}
                      </Link>
                    </div>
                  </article>
                )}
              </div>
            )}

            <div className="mt-8 grid gap-3 rounded-3xl border border-brand-950/8 bg-white p-6 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  label: locale === 'ne' ? 'एनएमसी दर्ता' : 'NMC registered',
                  sub: locale === 'ne' ? 'प्रमाणित चिकित्सक' : 'Verified clinicians',
                },
                {
                  icon: CalendarCheck,
                  label: locale === 'ne' ? 'अनुरोधमा समय' : 'Request-based slots',
                  sub: locale === 'ne' ? 'रिसेप्सनद्वारा पुष्टि' : 'Confirmed by reception',
                },
                {
                  icon: Users,
                  label: locale === 'ne' ? 'पारिवारिक प्रोफाइल' : 'Family profiles',
                  sub: locale === 'ne' ? 'एक खाताबाट ६ सम्म' : 'Up to 6 per account',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-ink">{item.label}</p>
                    <p className="text-[0.625rem] text-slate-500">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
