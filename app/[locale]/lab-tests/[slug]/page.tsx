import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getMessages, Locale } from '@/lib/i18n';
import { FlaskConical, Calendar, ArrowLeft, Home, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface LabTestDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function LabTestDetailPage({ params }: LabTestDetailPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const slug = resolvedParams.slug;
  const messages = getMessages(locale);
  const common = messages.common;

  const test = db.getLabTestBySlug(slug);
  if (!test || !test.isActive) {
    notFound();
  }

  const cat = db.getLabCategories().find((c) => c.id === test.categoryId);

  const name = locale === 'ne' && test.nameNe ? test.nameNe : test.nameEn;
  const description = locale === 'ne' && test.descriptionNe ? test.descriptionNe : test.descriptionEn;
  const prep = locale === 'ne' && test.prepInstructionsNe ? test.prepInstructionsNe : test.prepInstructionsEn;
  const sample = locale === 'ne' && test.sampleTypeNe ? test.sampleTypeNe : test.sampleTypeEn;
  const isMissingNepali = locale === 'ne' && !test.nameNe;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link
        href={`/${locale}/lab-tests`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{locale === 'ne' ? 'सबै ल्याब परीक्षणहरूमा फर्कनुहोस्' : 'Back to Lab Catalogue'}</span>
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-5">
            <div className="h-16 w-16 rounded-2xl bg-cyan-50 text-cyan-800 flex items-center justify-center shrink-0">
              <FlaskConical className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 block">
                {cat?.nameEn || 'Diagnostic Investigation'}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mt-0.5">
                {name}
              </h1>
              {sample && (
                <p className="text-xs text-slate-500 mt-1">
                  <strong>Specimen / Sample:</strong> {sample}
                </p>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Diagnostic Fee
            </span>
            <span className="text-xl font-bold text-slate-900 block mt-0.5">
              {test.price !== null ? `NPR ${test.price}` : (locale === 'ne' ? 'क्लिनिकद्वारा पुष्टि हुने' : 'Price confirmed by clinic')}
            </span>
            {test.isHomeCollectionAvailable && (
              <span className="text-[10px] text-teal-800 font-semibold block mt-1">
                ✓ Home collection eligible
              </span>
            )}
          </div>
        </div>

        {isMissingNepali && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 leading-relaxed">
            {common.nepaliMissingNote}
          </div>
        )}

        {/* Clinical Preparation Instructions */}
        {prep && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-1.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-cyan-700" />
              <span>{locale === 'ne' ? 'परीक्षण पूर्वतयारी निर्देशनहरू' : 'Clinic-Approved Preparation Instructions'}</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line pl-6">
              {prep}
            </p>
          </div>
        )}

        {/* Clinical Overview / Description */}
        {description && (
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900">
              {locale === 'ne' ? 'परीक्षण सम्बन्धी जानकारी' : 'Clinical Significance & Diagnostic Purpose'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>
        )}

        {/* Booking Action */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500 max-w-sm">
            {messages.booking.requestNotice}
          </p>

          <Link
            href={`/${locale}/book?test=${test.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-800 hover:bg-teal-900 px-6 py-3 text-xs font-semibold text-white shadow-xs"
          >
            <Calendar className="h-4 w-4" />
            <span>{locale === 'ne' ? 'यो परीक्षण बुक गर्नुहोस्' : 'Request Lab Booking'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
