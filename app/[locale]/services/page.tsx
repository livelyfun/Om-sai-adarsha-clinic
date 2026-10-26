import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getMessages, Locale } from '@/lib/i18n';
import { Activity, Calendar, ArrowRight, Info, CheckCircle2 } from 'lucide-react';

interface ServicesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function MedicalServicesPage({ params }: ServicesPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);
  const common = messages.common;
  const nav = messages.nav;

  const services = db.getMedicalServices(true);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
          {locale === 'ne' ? 'क्लिनिकल सेवाहरू' : 'Outpatient Services'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          {nav.medicalServices}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {locale === 'ne'
            ? 'ओपीडी उपचार, खोप तथा स्वास्थ्य परामर्श सेवाहरू।'
            : 'Outpatient clinical procedures, diagnostic reviews, preventive packages, and expert consultations.'}
        </p>
      </div>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-2xl mx-auto space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
            <Activity className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {locale === 'ne' ? 'सेवा विवरण चाँडै आउँदैछ' : 'Services Catalogue Coming Soon'}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            {locale === 'ne'
              ? 'क्लिनिकद्वारा प्रमाणित सेवाहरूको विवरण तथा शुल्क छिट्टै अद्यावधिक गरिनेछ।'
              : 'Detailed descriptions, availability, and consultation fees for medical services will be published shortly.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((serv) => {
            const name = locale === 'ne' && serv.nameNe ? serv.nameNe : serv.nameEn;
            const description = locale === 'ne' && serv.descriptionNe ? serv.descriptionNe : serv.descriptionEn;
            const isMissingNepali = locale === 'ne' && !serv.nameNe;
            const isBookable = serv.bookingMode === 'request';

            return (
              <div
                key={serv.id}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs hover:border-emerald-700/60 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                      <Activity className="h-6 w-6" />
                    </div>
                    {isBookable ? (
                      <span className="text-[10px] bg-teal-50 text-teal-800 px-2.5 py-1 rounded-full font-bold border border-teal-200">
                        {locale === 'ne' ? 'अनलाइन अनुरोध योग्य' : 'Appointment Request'}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                        {locale === 'ne' ? 'जानकारी मात्र' : 'Informational'}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{name}</h3>
                    {isMissingNepali && (
                      <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-2 text-[10px] text-amber-900">
                        {common.nepaliMissingNote}
                      </div>
                    )}
                    {description && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Standard Fee</span>
                    <span className="font-bold text-slate-900">
                      {serv.fee > 0 ? `NPR ${serv.fee}` : (locale === 'ne' ? 'निःशुल्क / काउन्टरमा तय' : 'Free / In-person')}
                    </span>
                  </div>

                  <Link
                    href={`/${locale}/services/${serv.slug}`}
                    className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:underline"
                  >
                    <span>{locale === 'ne' ? 'थप जानकारी' : 'Details & Booking'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
