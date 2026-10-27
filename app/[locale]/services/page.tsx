import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getMessages, Locale } from '@/lib/i18n';
import { uniqueBy } from '@/lib/utils';
import { Activity, ArrowRight, HeartPulse, ShieldCheck, Clock3, Stethoscope, Calendar } from 'lucide-react';
import PageHeader from '@/components/public/PageHeader';

interface ServicesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function MedicalServicesPage({ params }: ServicesPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);
  const common = messages.common;
  const nav = messages.nav;

  const services = uniqueBy(db.getMedicalServices(true), (service) => service.nameEn);

  return (
    <div className="bg-cream">
      <PageHeader
        eyebrow={locale === 'ne' ? 'ओपीडी सेवाहरू' : 'Outpatient services'}
        title={nav.medicalServices}
        description={
          locale === 'ne'
            ? 'ओपीडी उपचार, खोप तथा स्वास्थ्य परामर्श सेवाहरू — पारदर्शी शुल्क र स्पष्ट प्रक्रियासहित।'
            : 'Outpatient procedures, diagnostic reviews, preventive packages and expert consultations — with clear pricing.'
        }
      />

      <div className="container-x py-12 sm:py-14">
        {services.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-brand-950/15 bg-white px-8 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <Activity className="h-7 w-7" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-ink">
              {locale === 'ne' ? 'सेवा विवरण चाँडै आउँदैछ' : 'Services catalogue coming soon'}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
              {locale === 'ne'
                ? 'क्लिनिकद्वारा प्रमाणित सेवाहरूको विवरण तथा शुल्क छिट्टै अद्यावधिक गरिनेछ।'
                : 'Detailed descriptions, availability and consultation fees for medical services will be published shortly.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {services.length} {locale === 'ne' ? 'सेवाहरू' : services.length === 1 ? 'service' : 'services'}
              </p>
              <Link href={`/${locale}/book`} className="link-arrow">
                {locale === 'ne' ? 'सेवा अनुरोध गर्नुहोस्' : 'Request a service'}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((serv) => {
                const name = locale === 'ne' && serv.nameNe ? serv.nameNe : serv.nameEn;
                const description =
                  locale === 'ne' && serv.descriptionNe ? serv.descriptionNe : serv.descriptionEn;
                const isMissingNepali = locale === 'ne' && !serv.nameNe;
                const isBookable = serv.bookingMode === 'request';

                return (
                  <article key={serv.id} className="group card card-hover flex flex-col overflow-hidden">
                    <div className="relative h-20 overflow-hidden bg-gradient-to-br from-brand-800 to-brand-950">
                      <div className="absolute inset-0 bg-grid-light opacity-40" />
                      <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-sand-400/15 blur-xl" />
                      <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-brand-50 backdrop-blur">
                        {isBookable
                          ? locale === 'ne'
                            ? 'अनलाइन अनुरोध'
                            : 'Online request'
                          : locale === 'ne'
                            ? 'काउन्टरमा'
                            : 'Walk-in'}
                      </span>
                    </div>

                    <div className="relative flex flex-1 flex-col px-5 pb-5">
                      <div className="-mt-7 grid h-14 w-14 place-items-center rounded-2xl border-4 border-white bg-brand-50 text-brand-800 shadow-sm">
                        <HeartPulse className="h-6 w-6" />
                      </div>

                      <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-ink">
                        {name}
                      </h3>

                      {isMissingNepali && (
                        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[0.625rem] text-amber-800">
                          {common.nepaliMissingNote}
                        </p>
                      )}

                      <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-slate-600">
                        {description ||
                          (locale === 'ne' ? 'विवरण क्लिनिकमा उपलब्ध।' : 'Details available at reception.')}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-brand-950/8 pt-4">
                        <div>
                          <p className="text-[0.5625rem] uppercase tracking-[0.12em] text-slate-400">
                            {locale === 'ne' ? 'सेवा शुल्क' : 'Service fee'}
                          </p>
                          <p className="font-display text-sm font-semibold text-ink">
                            {serv.fee !== null && serv.fee > 0
                              ? `NPR ${serv.fee}`
                              : locale === 'ne'
                                ? 'काउन्टरमा पुष्टि'
                                : 'Confirmed at counter'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/${locale}/services/${serv.slug}`}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[0.6875rem] font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-900"
                          >
                            {locale === 'ne' ? 'विवरण' : 'Details'}
                          </Link>
                          {isBookable && (
                            <Link
                              href={`/${locale}/book?service=${serv.id}`}
                              className="inline-flex items-center gap-1 rounded-full bg-brand-800 px-3.5 py-1.5 text-[0.6875rem] font-bold text-white shadow-xs transition-all hover:bg-brand-900 hover:shadow-sm"
                            >
                              <Calendar className="h-3 w-3" />
                              {locale === 'ne' ? 'अनुरोध' : 'Request'}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-8 grid gap-5 rounded-3xl bg-brand-900 p-7 text-white sm:grid-cols-[1.4fr_1fr] sm:items-center">
          <div>
            <p className="eyebrow text-sand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-sand-400" />
              {locale === 'ne' ? 'सहयोग चाहिन्छ?' : 'Not sure what you need?'}
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
              {locale === 'ne' ? 'रिसेप्सनसँग कुरा गर्नुहोस्' : 'Talk to our reception team'}
            </h3>
            <p className="mt-2 max-w-lg text-xs leading-relaxed text-brand-100/75">
              {locale === 'ne'
                ? 'कुन सेवा वा परीक्षण उपयुक्त हुन्छ भन्ने निश्चित छैन? हामी मार्गदर्शन गर्न तयार छौं।'
                : 'Tell us what you are experiencing and we will guide you to the right doctor or test.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 sm:justify-end">
            <Link href={`/${locale}/book`} className="btn btn-accent !px-4 !py-2.5 text-xs">
              {common.bookSession}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href={`/${locale}/doctors`} className="btn btn-outline-light !px-4 !py-2.5 text-xs">
              <Stethoscope className="h-3.5 w-3.5" />
              {nav.doctors}
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.6875rem] font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
            {locale === 'ne' ? 'प्रमाणित स्वास्थ्य संस्था' : 'Registered healthcare facility'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 text-brand-600" />
            {locale === 'ne' ? 'अनुरोध रिसेप्सनद्वारा पुष्टि' : 'Requests confirmed by reception'}
          </span>
        </div>
      </div>
    </div>
  );
}
