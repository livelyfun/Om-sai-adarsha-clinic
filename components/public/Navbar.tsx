'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Menu,
  X,
  Calendar,
  User,
  Clock,
  Phone,
  Facebook,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import ClinicLogo from './ClinicLogo';

interface NavbarProps {
  locale: Locale;
  messages: any;
  phone?: string;
  openingHours?: string;
  facebookUrl?: string;
}

export default function Navbar({
  locale,
  messages,
  phone,
  openingHours,
  facebookUrl,
}: NavbarProps) {
  const pathname = usePathname() || '';
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const exploreDropdownRef = useRef<HTMLDivElement>(null);

  const t = messages.nav;
  const common = messages.common;
  const targetLocale = locale === 'en' ? 'ne' : 'en';
  const switchUrl = pathname ? pathname.replace(`/${locale}`, `/${targetLocale}`) : `/${targetLocale}`;

  const mainLinks = [
    { href: `/${locale}`, label: t.home },
    { href: `/${locale}/doctors`, label: t.doctors },
    { href: `/${locale}/services`, label: t.medicalServices },
    { href: `/${locale}/lab-tests`, label: t.labTests },
  ];

  const exploreLinks = [
    { href: `/${locale}/explore/about`, label: t.about },
    { href: `/${locale}/explore/faq`, label: t.faq },
    { href: `/${locale}/explore/health-info`, label: t.healthInfo },
  ];

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

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

  useEffect(() => {
    function handleScroll() {
      if (isMobileMenuOpen) return;

      const currentScrollY = window.scrollY;
      const prevScrollY = lastScrollYRef.current;

      // Always visible near top of page
      if (currentScrollY <= 30) {
        setIsVisible(true);
      } else if (currentScrollY > prevScrollY && currentScrollY > 90) {
        // Scrolling down past threshold -> hide navbar
        setIsVisible(false);
        setIsExploreOpen(false);
      } else if (currentScrollY < prevScrollY - 5) {
        // Scrolling up -> reveal navbar
        setIsVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-transform duration-300 ease-in-out',
        isVisible ? 'shadow-sm' : '-translate-y-full shadow-none'
      )}
    >
      {/* Utility strip */}
      <div className="hidden bg-brand-950 text-brand-100/90 lg:block border-b border-brand-900/60">
        <div className="container-x flex h-9 items-center justify-between text-[0.6875rem] font-medium tracking-wide">
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sand-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sand-400" />
              </span>
              <span className="font-semibold text-sand-300">{locale === 'ne' ? 'क्लिनिक खुला' : 'Clinic Open'}</span>
              <span className="text-brand-300/60">·</span>
              <span className="text-brand-200/90">{openingHours}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-brand-300/80">
              <ShieldCheck className="h-3.5 w-3.5 text-sand-400" />
              {locale === 'ne' ? 'एनएमसी दर्ता स्वास्थ्य संस्था' : 'NMC Registered Medical Facility'}
            </span>
          </div>
          <div className="flex items-center gap-5">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-brand-100 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Phone className="h-3.5 w-3.5 text-sand-400" />
                <span className="font-semibold">{phone}</span>
              </a>
            )}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-200/80 transition-colors hover:text-white"
              >
                <Facebook className="h-3.5 w-3.5 text-sand-400" />
                <span>Facebook</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="border-b border-brand-950/8 bg-white/95 backdrop-blur-md">
        <div className="container-x flex h-[4.75rem] items-center justify-between gap-4">
          <ClinicLogo locale={locale} showTagline={false} className="lg:hidden" />
          <ClinicLogo locale={locale} className="hidden lg:flex" />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {mainLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative whitespace-nowrap rounded-xl px-3.5 py-2 text-[0.875rem] font-semibold transition-all duration-150',
                    active
                      ? 'bg-brand-50 text-brand-900 shadow-xs'
                      : 'text-slate-600 hover:bg-brand-50/60 hover:text-brand-900'
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-brand-700" />
                  )}
                </Link>
              );
            })}

            <div className="relative" ref={exploreDropdownRef}>
              <button
                type="button"
                onClick={() => setIsExploreOpen(!isExploreOpen)}
                aria-expanded={isExploreOpen}
                className={cn(
                  'flex items-center gap-1 whitespace-nowrap rounded-xl px-3.5 py-2 text-[0.875rem] font-semibold transition-all duration-150',
                  pathname.includes('/explore')
                    ? 'bg-brand-50 text-brand-900 shadow-xs'
                    : 'text-slate-600 hover:bg-brand-50/60 hover:text-brand-900'
                )}
              >
                {t.explore}
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-slate-400 transition-transform duration-200',
                    isExploreOpen && 'rotate-180'
                  )}
                />
              </button>

              {isExploreOpen && (
                <div className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border border-brand-950/10 bg-white p-2 shadow-lift animate-fade-up">
                  {exploreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsExploreOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[0.8125rem] font-medium text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-900"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bilingual toggle pill */}
            <Link
              href={switchUrl}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-brand-950/15 bg-brand-50/50 px-3 py-1.5 text-[0.75rem] font-bold text-brand-900 transition-all hover:bg-brand-100/70 hover:border-brand-400"
              title={t.switchLanguageLabel}
            >
              <span className="text-brand-700">🌐</span>
              <span>{locale === 'en' ? 'नेपाली' : 'English'}</span>
            </Link>

            <Link
              href={`/${locale}/portal/login`}
              className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[0.78125rem] font-bold text-slate-700 shadow-xs transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-950"
            >
              <User className="h-3.5 w-3.5 text-brand-600" />
              <span>{locale === 'ne' ? 'बिरामी पोर्टल' : 'Patient Portal'}</span>
            </Link>

            <Link
              href={`/${locale}/book`}
              className="btn btn-accent !px-4 !py-2.5 text-xs shadow-md"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{common.bookSession}</span>
              <span className="sm:hidden">{locale === 'ne' ? 'बुकिङ' : 'Book'}</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(true);
                setIsVisible(true);
              }}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
              aria-label={t.openMenu}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!isMobileMenuOpen}
      >
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className={cn(
            'absolute inset-0 bg-brand-950/50 backdrop-blur-sm transition-opacity duration-300',
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          )}
        />
        <div
          className={cn(
            'absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-cream shadow-2xl transition-transform duration-300 ease-out',
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex items-center justify-between border-b border-brand-950/10 px-5 py-4">
            <ClinicLogo locale={locale} showTagline={false} />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full border border-brand-950/10 bg-white text-slate-600"
              aria-label={t.closeMenu}
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-5" aria-label="Mobile">
            <p className="px-3 pb-2 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {locale === 'ne' ? 'मुख्य मेनु' : 'Menu'}
            </p>
            <div className="space-y-1">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center justify-between rounded-xl px-3 py-3 text-[0.9375rem] font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-white text-brand-900 shadow-sm'
                      : 'text-slate-700 hover:bg-white'
                  )}
                >
                  {link.label}
                  <ChevronDown className="h-4 w-4 -rotate-90 text-slate-300" />
                </Link>
              ))}
            </div>

            <p className="px-3 pb-2 pt-6 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {t.explore}
            </p>
            <div className="space-y-1">
              {exploreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-brand-900"
                >
                  {link.label}
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-300" />
                </Link>
              ))}
            </div>

            <div className="mt-6 space-y-2.5 border-t border-brand-950/10 pt-5">
              <Link
                href={`/${locale}/book`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn btn-primary w-full"
              >
                <Calendar className="h-4 w-4" />
                {common.bookSession}
              </Link>
              <Link
                href={`/${locale}/portal/login`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn btn-ghost w-full"
              >
                <User className="h-4 w-4 text-brand-600" />
                {locale === 'ne' ? 'बिरामी लगइन' : 'Patient Login'}
              </Link>
              <Link
                href={switchUrl}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-950/10 py-2.5 text-xs font-semibold text-brand-800"
              >
                {t.switchLanguage}
              </Link>
            </div>
          </nav>

          <div className="border-t border-brand-950/10 bg-white/60 px-6 py-5 text-[0.6875rem] text-slate-500">
            {phone && (
              <a href={`tel:${phone}`} className="mb-2 flex items-center gap-2 font-semibold text-brand-900">
                <Phone className="h-3.5 w-3.5 text-brand-600" />
                {phone}
              </a>
            )}
            <p className="flex items-start gap-2 leading-relaxed">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
              {openingHours}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
