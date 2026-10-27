import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ArrowUpRight, Facebook, ShieldCheck } from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { db } from '@/lib/db';
import ClinicLogo from './ClinicLogo';

interface FooterProps {
  locale: Locale;
  messages: any;
}

export default function Footer({ locale, messages }: FooterProps) {
  const t = messages.footer;
  const common = messages.common;
  const nav = messages.nav;

  const address = locale === 'ne'
    ? (db.getSetting('address_ne') || db.getSetting('address_en') || '')
    : (db.getSetting('address_en') || '');
  const phone = db.getSetting('phone') || '';
  const email = db.getSetting('email') || '';
  const facebookUrl = db.getSetting('facebook_url') || 'https://www.facebook.com/p/Om-Sai-Aadarsha-Clinic-100084050983392/';
  const openingHours = locale === 'ne'
    ? (db.getSetting('opening_hours_ne') || 'आइतबार – शुक्रबार: बिहान ०७:०० – साँझ ०८:०० (शनिबार बन्द)')
    : (db.getSetting('opening_hours_en') || 'Sunday – Friday: 07:00 AM – 08:00 PM (Saturday Closed)');
  const emergencyPhone = db.getSetting('emergency_phone') || '';

  const quickLinks = [
    { href: `/${locale}`, label: nav.home },
    { href: `/${locale}/doctors`, label: nav.doctors },
    { href: `/${locale}/services`, label: nav.medicalServices },
    { href: `/${locale}/lab-tests`, label: nav.labTests },
    { href: `/${locale}/explore/about`, label: nav.about },
    { href: `/${locale}/explore/faq`, label: nav.faq },
  ];

  const patientLinks = [
    { href: `/${locale}/portal/login`, label: common.myAccount },
    { href: `/${locale}/book`, label: common.bookSession },
    { href: `/${locale}/privacy`, label: t.privacyPolicy },
    { href: `/${locale}/terms`, label: t.bookingTerms },
  ];

  return (
    <footer className="relative overflow-hidden bg-brand-950 text-brand-100">
      <div className="pointer-events-none absolute inset-0 bg-grid-light opacity-40" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-700/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-sand-500/10 blur-3xl" />

      <div className="container-x relative py-14 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Identity */}
          <div className="space-y-5 lg:col-span-4">
            <ClinicLogo locale={locale} variant="dark" />
            <p className="max-w-xs text-sm leading-relaxed text-brand-100/70">
              {t.aboutClinic}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.6875rem] font-medium text-brand-100/80">
              <ShieldCheck className="h-3.5 w-3.5 text-sand-400" />
              {locale === 'ne' ? 'नेपाल सरकार दर्ता स्वास्थ्य संस्था' : 'Government of Nepal registered facility'}
            </div>
            {facebookUrl && (
              <div>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-brand-200 transition-colors hover:text-white"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10">
                    <Facebook className="h-3.5 w-3.5" />
                  </span>
                  {locale === 'ne' ? 'फेसबुकमा क्लिनिक पेज' : 'Official Facebook page'}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Sitemap */}
          <div className="lg:col-span-2">
            <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-sand-300">
              {t.quickLinks}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-brand-100/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Patient services */}
          <div className="lg:col-span-2">
            <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-sand-300">
              {t.patientServices}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {patientLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-brand-100/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-sand-300">
              {t.contactHeading}
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-start gap-2.5 text-brand-100/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sand-400" />
                <span className="leading-relaxed">
                  {address || (locale === 'ne' ? 'ठेगाना क्लिनिकद्वारा पुष्टि हुने' : 'Location confirmed by clinic')}
                </span>
              </div>
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-2.5 font-medium text-white transition-colors hover:text-sand-300"
                >
                  <Phone className="h-4 w-4 shrink-0 text-sand-400" />
                  {phone}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2.5 text-brand-100/70 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0 text-sand-400" />
                  {email}
                </a>
              )}
              {emergencyPhone && (
                <div className="flex items-center gap-2.5 text-rose-300">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className="text-xs">
                    {locale === 'ne' ? 'आपतकालीन: ' : 'Emergency: '}
                    <strong>{emergencyPhone}</strong>
                  </span>
                </div>
              )}
              <div className="flex items-start gap-2.5 border-t border-white/10 pt-3 text-xs text-brand-100/60">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sand-400" />
                <span className="leading-relaxed">{openingHours}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-[0.6875rem] text-brand-100/50 sm:flex-row">
          <p>{t.copyright}</p>
          <div className="flex items-center gap-3">
            <Link href="/en" className="transition-colors hover:text-white">English</Link>
            <span className="h-1 w-1 rounded-full bg-brand-100/30" />
            <Link href="/ne" className="transition-colors hover:text-white">नेपाली</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
