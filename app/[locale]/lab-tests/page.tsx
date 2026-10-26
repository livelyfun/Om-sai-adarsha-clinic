import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getMessages, Locale } from '@/lib/i18n';
import { FlaskConical, Calendar, ArrowRight, Info, CheckCircle2, Home } from 'lucide-react';

interface LabTestsPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ category?: string; q?: string }>;
}

export default async function LabTestsCataloguePage({ params, searchParams }: LabTestsPageProps) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);
  const common = messages.common;
  const nav = messages.nav;

  const selectedCategory = resolvedSearch?.category || 'all';
  const query = (resolvedSearch?.q || '').toLowerCase();

  const categories = db.getLabCategories();
  const allActiveTests = db.getLabTests(true, selectedCategory === 'all' ? undefined : selectedCategory);

  const tests = allActiveTests.filter((t) => {
    if (!query) return true;
    const matchName = t.nameEn.toLowerCase().includes(query) || (t.nameNe && t.nameNe.includes(query));
    return matchName;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
          {locale === 'ne' ? 'डायग्नोस्टिक ल्याब' : 'Diagnostic Investigations'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          {nav.labTests}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {locale === 'ne'
            ? 'प्रमाणित प्रयोगशाला परीक्षणहरूको सूची, आवश्यक पूर्वतयारी तथा नमुना संकलन निर्देशनहरू।'
            : 'Explore categorized laboratory investigations, certified test preparations, and secure digital report release.'}
        </p>
      </div>

      {allActiveTests.length === 0 && categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-2xl mx-auto space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-800">
            <FlaskConical className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {locale === 'ne' ? 'ल्याब परीक्षण सूची अद्यावधिक हुँदैछ' : 'Lab Test Directory Updating'}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            {locale === 'ne'
              ? 'क्लिनिकको अत्याधुनिक प्रयोगशालाद्वारा गरिने परीक्षणहरूको सूची र नमुना संकलन विधि चाँडै उपलब्ध हुनेछ।'
              : 'Certified lab test categories, certified pricing, and clinical preparation guidelines are being configured in the CMS.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Category Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
              <Link
                href={`/${locale}/lab-tests`}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-teal-800 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {locale === 'ne' ? 'सबै परीक्षणहरू' : 'All Tests'}
              </Link>
              {categories.map((cat) => {
                const catName = locale === 'ne' && cat.nameNe ? cat.nameNe : cat.nameEn;
                const isSelected = selectedCategory === cat.id;
                return (
                  <Link
                    key={cat.id}
                    href={`/${locale}/lab-tests?category=${cat.id}`}
                    className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'bg-teal-800 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {catName}
                  </Link>
                );
              })}
            </div>

            <form method="GET" className="w-full sm:w-72 relative">
              {selectedCategory !== 'all' && (
                <input type="hidden" name="category" value={selectedCategory} />
              )}
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder={locale === 'ne' ? 'परीक्षणको नाम खोज्नुहोस्...' : 'Search lab investigations...'}
                className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-3.5 pr-8 text-xs text-slate-900 shadow-xs focus:border-teal-700 focus:outline-hidden"
              />
            </form>
          </div>

          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => {
              const name = locale === 'ne' && test.nameNe ? test.nameNe : test.nameEn;
              const prep = locale === 'ne' && test.prepInstructionsNe ? test.prepInstructionsNe : test.prepInstructionsEn;
              const sample = locale === 'ne' && test.sampleTypeNe ? test.sampleTypeNe : test.sampleTypeEn;
              const isMissingNepali = locale === 'ne' && !test.nameNe;

              return (
                <div
                  key={test.id}
                  className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs hover:border-cyan-700/60 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="h-12 w-12 rounded-xl bg-cyan-50 text-cyan-800 flex items-center justify-center">
                        <FlaskConical className="h-6 w-6" />
                      </div>
                      {test.isHomeCollectionAvailable && (
                        <span className="flex items-center gap-1 text-[10px] bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded-full font-medium">
                          <Home className="h-3 w-3" />
                          <span>{locale === 'ne' ? 'होम संकलन' : 'Home Sample'}</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug">{name}</h3>
                      {sample && (
                        <p className="text-[11px] text-cyan-900 font-medium mt-1">
                          Sample: {sample}
                        </p>
                      )}
                      {isMissingNepali && (
                        <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-2 text-[10px] text-amber-900">
                          {common.nepaliMissingNote}
                        </div>
                      )}
                      {prep && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          <strong className="text-slate-700">Prep:</strong> {prep}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Price</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {test.price !== null ? `NPR ${test.price}` : (locale === 'ne' ? 'क्लिनिकद्वारा पुष्टि हुने' : 'Price confirmed by clinic')}
                      </span>
                    </div>

                    <Link
                      href={`/${locale}/lab-tests/${test.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-cyan-800 hover:underline"
                    >
                      <span>{locale === 'ne' ? 'निर्देशन तथा बुकिङ' : 'Details & Prep'}</span>
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
