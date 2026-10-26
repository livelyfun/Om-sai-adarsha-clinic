import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { db } from '@/lib/db';

interface FooterProps {
  locale: Locale;
  messages: any;
}

export default function Footer({ locale, messages }: FooterProps) {
  const t = messages.footer;
  const common = messages.common;
  const nav = messages.nav;

  const clinicName = db.getSetting('clinic_name') || 'Om Sai Aadarsha Clinic';
  const clinicNameNe = db.getSetting('clinic_name_ne') || 'ॐ साई आदर्श क्लिनिक';
  const address = locale === 'ne' ? (db.getSetting('address_ne') || db.getSetting('address_en') || '') : (db.getSetting('address_en') || '');
  const phone = db.getSetting('phone') || '';
  const email = db.getSetting('email') || '';
  const facebookUrl = db.getSetting('facebook_url') || 'https://www.facebook.com/p/Om-Sai-Aadarsha-Clinic-100084050983392/';
  const openingHours = locale === 'ne'
    ? (db.getSetting('opening_hours_ne') || 'आइतबार – शुक्रबार: बिहान ०७:०० – साँझ ०८:०० (शनिबार बन्द)')
    : (db.getSetting('opening_hours_en') || 'Sunday – Friday: 07:00 AM – 08:00 PM (Saturday Closed)');
  const emergencyPhone = db.getSetting('emergency_phone') || '';

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-12">
          {/* Col 1: Clinic Identity & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
                <Activity className="h-5 w-5" />
              </div>
              <span className="font-serif text-lg font-bold text-white tracking-tight">
                {locale === 'ne' ? clinicNameNe : clinicName}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.aboutClinic}
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-teal-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Government of Nepal Regd. Healthcare Facility</span>
            </div>

            {facebookUrl && (
              <div className="pt-1">
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-colors"
                >
                  <span>{locale === 'ne' ? 'फेसबुकमा क्लिनिक पेज' : 'Official Facebook Page'}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t.quickLinks}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href={`/${locale}`} className="hover:text-teal-400 transition-colors">
                  {nav.home}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/doctors`} className="hover:text-teal-400 transition-colors">
                  {nav.doctors}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/services`} className="hover:text-teal-400 transition-colors">
                  {nav.medicalServices}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/lab-tests`} className="hover:text-teal-400 transition-colors">
                  {nav.labTests}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/explore/about`} className="hover:text-teal-400 transition-colors">
                  {nav.about}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/explore/faq`} className="hover:text-teal-400 transition-colors">
                  {nav.faq}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Patient Portal & Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t.patientServices}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href={`/${locale}/portal/login`}
                  className="font-medium text-teal-300 hover:text-teal-200 transition-colors"
                >
                  {common.myAccount}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/book`} className="hover:text-teal-400 transition-colors">
                  {common.bookSession}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-teal-400 transition-colors">
                  {t.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="hover:text-teal-400 transition-colors">
                  {t.bookingTerms}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hours */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t.contactHeading}
            </h3>
            <div className="space-y-2.5 text-sm text-slate-400">
              {address ? (
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>{address}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs italic text-slate-500">
                  <MapPin className="h-4 w-4" />
                  <span>Location details to be confirmed by clinic</span>
                </div>
              )}

              {phone ? (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>{phone}</span>
                </div>
              ) : null}

              {email ? (
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>{email}</span>
                </div>
              ) : null}

              {emergencyPhone && (
                <div className="flex items-center gap-2.5 text-red-400">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className="text-xs">
                    {locale === 'ne' ? 'आपतकालीन: ' : 'Emergency: '}
                    <strong>{emergencyPhone}</strong>
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-start gap-2 text-xs text-slate-400">
                  <Clock className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{openingHours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{t.copyright}</p>
          <div className="flex items-center gap-4">
            <Link href="/en" className="hover:text-slate-300">English</Link>
            <span>•</span>
            <Link href="/ne" className="hover:text-slate-300">नेपाली</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
