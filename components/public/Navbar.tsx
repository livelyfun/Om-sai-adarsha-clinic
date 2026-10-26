'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, Shield, Activity, Calendar, User } from 'lucide-react';
import { Locale } from '@/lib/i18n';

interface NavbarProps {
  locale: Locale;
  messages: any;
}

export default function Navbar({ locale, messages }: NavbarProps) {
  const pathname = usePathname();
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const exploreDropdownRef = useRef<HTMLDivElement>(null);

  const t = messages.nav;
  const common = messages.common;
  const targetLocale = locale === 'en' ? 'ne' : 'en';

  // Compute equivalent URL for language switch
  const switchUrl = pathname ? pathname.replace(`/${locale}`, `/${targetLocale}`) : `/${targetLocale}`;

  // Close explore dropdown on outside click or Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsExploreOpen(false);
        setIsMobileMenuOpen(false);
      }
    }
    function handleClickOutside(e: MouseEvent) {
      if (exploreDropdownRef.current && !exploreDropdownRef.current.contains(e.target as Node)) {
        setIsExploreOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-teal-900/10 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Far Left: Clinic Logo and Name */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 transition-opacity hover:opacity-90 focus:outline-hidden focus:ring-2 focus:ring-teal-700 rounded-md p-1"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-700 to-teal-900 text-white shadow-xs">
            <Activity className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
              {locale === 'ne' ? 'ॐ साई आदर्श क्लिनिक' : 'Om Sai Aadarsha Clinic'}
            </span>
            <span className="text-xs text-teal-800 font-medium tracking-wide">
              {common.clinicTagline}
            </span>
          </div>
        </Link>

        {/* Main Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <Link
            href={`/${locale}`}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              pathname === `/${locale}`
                ? 'text-teal-900 bg-teal-50 font-semibold'
                : 'text-slate-700 hover:text-teal-800 hover:bg-slate-50'
            }`}
          >
            {t.home}
          </Link>
          <Link
            href={`/${locale}/doctors`}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              pathname.includes('/doctors')
                ? 'text-teal-900 bg-teal-50 font-semibold'
                : 'text-slate-700 hover:text-teal-800 hover:bg-slate-50'
            }`}
          >
            {t.doctors}
          </Link>
          <Link
            href={`/${locale}/services`}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              pathname.includes('/services')
                ? 'text-teal-900 bg-teal-50 font-semibold'
                : 'text-slate-700 hover:text-teal-800 hover:bg-slate-50'
            }`}
          >
            {t.medicalServices}
          </Link>
          <Link
            href={`/${locale}/lab-tests`}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              pathname.includes('/lab-tests')
                ? 'text-teal-900 bg-teal-50 font-semibold'
                : 'text-slate-700 hover:text-teal-800 hover:bg-slate-50'
            }`}
          >
            {t.labTests}
          </Link>

          {/* Explore Dropdown */}
          <div className="relative" ref={exploreDropdownRef}>
            <button
              type="button"
              onClick={() => setIsExploreOpen(!isExploreOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsExploreOpen(!isExploreOpen);
                }
              }}
              aria-expanded={isExploreOpen}
              className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname.includes('/explore')
                  ? 'text-teal-900 bg-teal-50 font-semibold'
                  : 'text-slate-700 hover:text-teal-800 hover:bg-slate-50'
              }`}
            >
              <span>{t.explore}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isExploreOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExploreOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95">
                <Link
                  href={`/${locale}/explore/about`}
                  onClick={() => setIsExploreOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-900 transition-colors"
                >
                  {t.about}
                </Link>
                <Link
                  href={`/${locale}/explore/faq`}
                  onClick={() => setIsExploreOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-900 transition-colors"
                >
                  {t.faq}
                </Link>
                <Link
                  href={`/${locale}/explore/health-info`}
                  onClick={() => setIsExploreOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-900 transition-colors"
                >
                  {t.healthInfo}
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Far Right: Language Switch + Patient Login Text Link + Book a Session Primary Button */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href={switchUrl}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-teal-800 hover:text-teal-950 border border-teal-200 rounded-lg hover:bg-teal-50/60 transition-colors"
            title={t.switchLanguageLabel}
          >
            <span>{t.switchLanguage}</span>
          </Link>

          <Link
            href={`/${locale}/portal/login`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-teal-900 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          >
            <User className="h-4 w-4 text-teal-700" />
            <span>{common.myAccount}</span>
          </Link>

          <Link
            href={`/${locale}/book`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-900 transition-all active:scale-[0.98]"
          >
            <Calendar className="h-4 w-4" />
            <span>{common.bookSession}</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href={switchUrl}
            className="px-2.5 py-1 text-xs font-medium text-teal-800 border border-teal-300 rounded-md"
          >
            {t.switchLanguage}
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-teal-900 focus:outline-hidden"
            aria-label={isMobileMenuOpen ? t.closeMenu : t.openMenu}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl">
          <div className="flex flex-col space-y-1">
            <Link
              href={`/${locale}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-slate-800 rounded-md hover:bg-teal-50"
            >
              {t.home}
            </Link>
            <Link
              href={`/${locale}/doctors`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-slate-800 rounded-md hover:bg-teal-50"
            >
              {t.doctors}
            </Link>
            <Link
              href={`/${locale}/services`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-slate-800 rounded-md hover:bg-teal-50"
            >
              {t.medicalServices}
            </Link>
            <Link
              href={`/${locale}/lab-tests`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-slate-800 rounded-md hover:bg-teal-50"
            >
              {t.labTests}
            </Link>

            {/* Mobile Explore Group */}
            <div className="pt-2 pb-1 border-t border-slate-100">
              <span className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t.explore}
              </span>
              <div className="mt-1 pl-2 space-y-1">
                <Link
                  href={`/${locale}/explore/about`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-teal-50"
                >
                  {t.about}
                </Link>
                <Link
                  href={`/${locale}/explore/faq`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-teal-50"
                >
                  {t.faq}
                </Link>
                <Link
                  href={`/${locale}/explore/health-info`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-teal-50"
                >
                  {t.healthInfo}
                </Link>
              </div>
            </div>

            {/* Prominent Mobile Book a Session Button */}
            <div className="pt-4 border-t border-slate-200">
              <Link
                href={`/${locale}/book`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-3 text-base font-semibold text-white shadow-xs hover:bg-teal-900"
              >
                <Calendar className="h-5 w-5" />
                <span>{common.bookSession}</span>
              </Link>
            </div>

            {/* Mobile Patient Account Access */}
            <div className="pt-3">
              <Link
                href={`/${locale}/portal/login`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 py-2.5 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-100"
              >
                <User className="h-4 w-4 text-teal-700" />
                <span>{common.myAccount}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
