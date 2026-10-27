import React from 'react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { getMessages, isValidLocale, Locale } from '@/lib/i18n';
import { db } from '@/lib/db';

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

  const phone = db.getSetting('phone') || '+977 9800000000';
  const facebookUrl =
    db.getSetting('facebook_url') || 'https://www.facebook.com/p/Om-Sai-Aadarsha-Clinic-100084050983392/';
  const openingHours =
    locale === 'ne'
      ? db.getSetting('opening_hours_ne') || 'आइतबार – शुक्रबार: बिहान ०७:०० – साँझ ०८:००'
      : db.getSetting('opening_hours_en') || 'Sunday – Friday · 7:00 AM – 8:00 PM';

  return (
    <div className="flex min-h-screen flex-col bg-cream font-sans text-ink antialiased">
      {/* Public Navbar */}
      <Navbar
        locale={locale as Locale}
        messages={messages}
        phone={phone}
        openingHours={openingHours}
        facebookUrl={facebookUrl}
      />

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <Footer locale={locale as Locale} messages={messages} />
    </div>
  );
}
