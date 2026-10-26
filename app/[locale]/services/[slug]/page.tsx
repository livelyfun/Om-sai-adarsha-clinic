import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getMessages, Locale } from '@/lib/i18n';
import { Activity, Calendar, ArrowLeft, Info, CheckCircle2 } from 'lucide-react';

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
  const description = locale === 'ne' && service.descriptionNe ? service.descriptionNe : service.descriptionEn;
  const isMissingNepali = locale === 'ne' && !service.nameNe;
  const isBookable = service.bookingMode === 'request';

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link
        href={`/${locale}/services`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{locale === 'ne' ? 'सबै सेवाहरूमा फर्कनुहोस्' : 'Back to Services Directory'}</span>
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-5">
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {name}
              </h1>
              <span className="mt-1 inline-block text-xs font-bold text-teal-800 uppercase tracking-wider">
                {isBookable ? (locale === 'ne' ? 'अनुरोध-आधारित सेवा' : 'Appointment Request Service') : (locale === 'ne' ? 'जानकारीमूलक सेवा' : 'Informational Only')}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Estimated Fee</span>
            <span className="text-xl font-bold text-slate-900 block mt-0.5">
              {service.fee > 0 ? `NPR ${service.fee}` : (locale === 'ne' ? 'काउन्टरमा तय' : 'Standard Rate')}
            </span>
          </div>
        </div>

        {isMissingNepali && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 leading-relaxed">
            {common.nepaliMissingNote}
          </div>
        )}

        {description && (
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900">
              {locale === 'ne' ? 'सेवाको विस्तृत विवरण' : 'Clinical Service Overview'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>
        )}

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500 max-w-sm">
            {messages.booking.requestNotice}
          </p>

          {isBookable ? (
            <Link
              href={`/${locale}/book?service=${service.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-800 hover:bg-teal-900 px-6 py-3 text-xs font-semibold text-white shadow-xs"
            >
              <Calendar className="h-4 w-4" />
              <span>{locale === 'ne' ? 'सेवा अनुरोध गर्नुहोस्' : 'Request This Service'}</span>
            </Link>
          ) : (
            <span className="text-xs font-medium text-slate-500 italic">
              {locale === 'ne' ? 'यो सेवाको लागि प्रत्यक्ष क्लिनिक रिसेप्सनमा सम्पर्क गर्नुहोस्।' : 'In-person walk-in or reception inquiry only.'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
