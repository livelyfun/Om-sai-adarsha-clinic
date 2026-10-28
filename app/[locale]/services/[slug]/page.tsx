import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getMessages, Locale } from '@/lib/i18n';
import {
  Activity,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Phone,
} from 'lucide-react';

interface ServiceDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const slug = resolvedParams.slug;
  const messages = getMessages(locale);
  const common = messages.common;

  const service = db.getMedicalServiceBySlug(slug);
  if (!service || !service.isActive) {
    notFound();
  }

  const name = locale === 'ne' && service.nameNe ? service.nameNe : service.nameEn;
  const description =
    locale === 'ne' && service.descriptionNe ? service.descriptionNe : service.descriptionEn;
  const isMissingNepali = locale === 'ne' && !service.nameNe;
  const isBookable = service.bookingMode === 'request';
  const phone = db.getSetting('phone') || '+977 9800000000';

  return (
    <div className="bg-cream">
      <div className="border-b border-brand-950/8 bg-white">
        <div className="container-x py-4">
          <Link
            href={`/${locale}/services`}
            className="inline-flex min-h-9 items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate-500 transition-colors hover:text-brand-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {locale === 'ne' ? 'सेवा सूचीमा फर्कनुहोस्' : 'Back to services'}
          </Link>
        </div>
      </div>

      <div className="container-x max-w-5xl py-10 sm:py-14">
        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
          <article className="card overflow-hidden">
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-800 to-brand-950 px-7 py-8 text-white sm:px-9">
              <div className="pointer-events-none absolute inset-0 bg-grid-light opacity-30" />
              <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-sand-400/15 blur-2xl" />
              <div className="relative">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-sand-300">
                  <Activity className="h-6 w-6" />
                </span>
                <h1 className="display-title mt-5 text-3xl text-white sm:text-4xl">{name}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-brand-50">
                    {isBookable
                      ? locale === 'ne'
                        ? 'अनुरोध-आधारित सेवा'
                        : 'Request-based service'
                      : locale === 'ne'
                        ? 'जानकारीमूलक सेवा'
                        : 'Informational only'}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.625rem] font-semibold text-brand-50">
                    NPR {service.fee > 0 ? service.fee : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-7 sm:p-9">
              {isMissingNepali && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                  {common.nepaliMissingNote}
                </p>
              )}

              <div>
                <h2 className="font-display text-sm font-semibold text-ink">
                  {locale === 'ne' ? 'सेवाको विस्तृत विवरण' : 'Clinical overview'}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {description ||
                    (locale === 'ne'
                      ? 'विस्तृत जानकारी क्लिनिक रिसेप्सनमा उपलब्ध छ।'
                      : 'Detailed information is available at clinic reception.')}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: Clock,
                    title: locale === 'ne' ? 'अवधि' : 'Duration',
                    sub:
                      locale === 'ne'
                        ? 'रिसेप्सनले पुष्टि गर्ने'
                        : 'Confirmed with reception',
                  },
                  {
                    icon: ShieldCheck,
                    title: locale === 'ne' ? 'प्रमाणित सेवा' : 'Verified service',
                    sub:
                      locale === 'ne'
                        ? 'क्लिनिकद्वारा सञ्चालित'
                        : 'Delivered by clinic staff',
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-brand-950/8 bg-cream p-4">
                    <item.icon className="h-4 w-4 text-brand-600" />
                    <p className="mt-2 text-xs font-semibold text-ink">{item.title}</p>
                    <p className="mt-0.5 text-[0.625rem] text-slate-500">{item.sub}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-brand-950/8 pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-sm text-[0.6875rem] leading-relaxed text-slate-500">
                    {messages.booking.requestNotice}
                  </p>

                  {isBookable ? (
                    <Link
                      href={`/${locale}/book?service=${service.id}`}
                      className="btn btn-primary shrink-0 text-xs"
                    >
                      <Calendar className="h-4 w-4" />
                      {locale === 'ne' ? 'सेवा अनुरोध गर्नुहोस्' : 'Request this service'}
                    </Link>
                  ) : (
                    <span className="text-[0.6875rem] italic text-slate-500">
                      {locale === 'ne'
                        ? 'काउन्टरमा सम्पर्क गर्नुहोस्।'
                        : 'Walk-in or reception enquiry only.'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </article>

          <aside className="space-y-4">
            <div className="card p-6">
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                {locale === 'ne' ? 'सेवा शुल्क' : 'Service fee'}
              </span>
              <p className="display-title mt-3 text-3xl">
                {service.fee > 0 ? `NPR ${service.fee}` : '—'}
              </p>
              <p className="mt-2 text-[0.6875rem] leading-relaxed text-slate-500">
                {locale === 'ne'
                  ? 'अन्तिम बिल क्लिनिक काउन्टरमा भुक्तानी हुन्छ।'
                  : 'Final billing is settled in person at the clinic counter.'}
              </p>
              <div className="mt-5 space-y-2 border-t border-brand-950/8 pt-4 text-[0.6875rem] text-slate-600">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />
                  {locale === 'ne' ? 'अनलाइन भुक्तानी आवश्यक छैन' : 'No online payment required'}
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />
                  {locale === 'ne' ? 'अनुरोध रिसेप्सनद्वारा पुष्टि' : 'Request confirmed by reception'}
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-brand-950 p-6 text-white">
              <div className="pointer-events-none absolute inset-0 bg-grid-light opacity-25" />
              <div className="relative">
                <Phone className="h-5 w-5 text-sand-300" />
                <p className="mt-3 font-display text-sm font-semibold">
                  {locale === 'ne' ? 'रिसेप्सनलाई सोध्नुहोस्' : 'Ask reception'}
                </p>
                <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-brand-100/70">
                  {locale === 'ne'
                    ? 'सेवा सम्बन्धी थप जानकारीको लागि फोन गर्नुहोस्।'
                    : 'Call us for details about this service or preparation.'}
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
