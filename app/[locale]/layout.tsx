import React from 'react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { getMessages, isValidLocale, Locale } from '@/lib/i18n';
import { AlertCircle } from 'lucide-react';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale as Locale);
  const isDev = process.env.APP_ENV !== 'production';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* Sample Data Dev Banner (Section 11) */}
      {isDev && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-center text-xs font-semibold flex items-center justify-center gap-2 tracking-wide shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{messages.common.sampleDataBanner}</span>
        </div>
      )}

      {/* Public Navbar */}
      <Navbar locale={locale as Locale} messages={messages} />

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <Footer locale={locale as Locale} messages={messages} />
    </div>
  );
}
