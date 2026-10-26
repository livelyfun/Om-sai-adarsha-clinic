import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getMessages, Locale } from '@/lib/i18n';
import { Stethoscope, Calendar, ArrowRight, Clock, AlertCircle } from 'lucide-react';

interface DoctorsPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ q?: string }>;
}

export default async function DoctorsDirectoryPage({ params, searchParams }: DoctorsPageProps) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);
  const common = messages.common;
  const nav = messages.nav;

  const query = (resolvedSearch?.q || '').toLowerCase();
  const allActiveDoctors = db.getDoctors(true);

  const doctors = allActiveDoctors.filter((doc) => {
    if (!query) return true;
    const matchName = doc.nameEn.toLowerCase().includes(query) || (doc.nameNe && doc.nameNe.includes(query));
    const matchSpecialty = doc.specialtyEn.toLowerCase().includes(query) || (doc.specialtyNe && doc.specialtyNe.includes(query));
    return matchName || matchSpecialty;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
          {locale === 'ne' ? 'चिकित्सक परामर्श' : 'Outpatient Consultations'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          {nav.doctors}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {locale === 'ne'
            ? 'क्लिनिकका योग्य तथा अनुभवी चिकित्सकहरूको सूची, परामर्श समयतालिका र शुल्क विवरण।'
            : 'Explore certified specialist physicians, review weekly clinical schedules, and request an appointment.'}
        </p>
      </div>

      {/* Empty State per Section 13 if no published doctors */}
      {allActiveDoctors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-2xl mx-auto space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
            <Stethoscope className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {locale === 'ne' ? 'चिकित्सक सूची अद्यावधिक हुँदैछ' : 'Doctor Roster Updating'}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            {locale === 'ne'
              ? 'क्लिनिक प्रशासनद्वारा चिकित्सकहरूको प्रमाणित प्रोफाइल तथा साप्ताहिक समयतालिका चाँडै सार्वजनिक गरिनेछ।'
              : 'Doctor profiles and verified weekly consultation schedules are currently being updated by clinic administration.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="max-w-md mx-auto">
            <form method="GET" className="relative">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder={locale === 'ne' ? 'चिकित्सक वा विशेषज्ञता खोज्नुहोस्...' : 'Search by physician name or specialty...'}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-4 pr-10 text-xs text-slate-900 shadow-xs focus:border-teal-700 focus:outline-hidden"
              />
              <button type="submit" className="absolute right-2.5 top-2.5 text-xs text-teal-800 font-bold">
                {locale === 'ne' ? 'खोज्नुहोस्' : 'Search'}
              </button>
            </form>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => {
              const name = locale === 'ne' && doc.nameNe ? doc.nameNe : doc.nameEn;
              const specialty = locale === 'ne' && doc.specialtyNe ? doc.specialtyNe : doc.specialtyEn;
              const qualifications = locale === 'ne' && doc.qualificationsNe ? doc.qualificationsNe : doc.qualificationsEn;
              const isMissingNepali = locale === 'ne' && (!doc.nameNe || !doc.specialtyNe);

              return (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs hover:border-teal-700/60 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-teal-50 border border-teal-100 text-teal-800 flex items-center justify-center font-bold text-xl shrink-0">
                        <Stethoscope className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 leading-snug">
                          {name}
                        </h3>
                        <p className="text-xs font-semibold text-teal-800 mt-0.5">
                          {specialty}
                        </p>
                        {qualifications && (
                          <p className="text-[11px] text-slate-500 mt-1">
                            {qualifications}
                          </p>
                        )}
                      </div>
                    </div>

                    {isMissingNepali && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-[10px] text-amber-900 leading-snug">
                        {common.nepaliMissingNote}
                      </div>
                    )}

                    {doc.bioEn && (
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {locale === 'ne' && doc.bioNe ? doc.bioNe : doc.bioEn}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Consultation Fee</span>
                      <span className="font-bold text-slate-900 text-sm">
                        NPR {doc.consultationFee}
                      </span>
                    </div>

                    <Link
                      href={`/${locale}/doctors/${doc.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 px-4 py-2 text-xs font-semibold text-white transition-colors"
                    >
                      <span>{locale === 'ne' ? 'विवरण र समय' : 'View Schedule'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
