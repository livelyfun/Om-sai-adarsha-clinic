import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Locale } from '@/lib/i18n';

interface ClinicLogoProps {
  locale: Locale;
  variant?: 'light' | 'dark';
  showTagline?: boolean;
  className?: string;
}

/**
 * Brand lockup: the ॐ mark in a deep evergreen tile, followed by the clinic
 * name and a short positioning line.
 */
export default function ClinicLogo({
  locale,
  variant = 'light',
  showTagline = true,
  className,
}: ClinicLogoProps) {
  const name = locale === 'ne' ? 'ॐ साई आदर्श क्लिनिक' : 'Om Sai Aadarsha Clinic';
  const tagline =
    locale === 'ne' ? 'ओपीडी तथा डायग्नोस्टिक्स' : 'Outpatient & Diagnostics';

  return (
    <Link
      href={`/${locale}`}
      aria-label={name}
      className={cn(
        'group flex items-center gap-3 rounded-2xl transition-opacity hover:opacity-90',
        className
      )}
    >
      <span
        className={cn(
          'relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[0.9rem] shadow-sm transition-transform duration-300 group-hover:-rotate-3',
          variant === 'light'
            ? 'bg-brand-900 text-sand-200'
            : 'bg-white/10 text-sand-200 ring-1 ring-white/20'
        )}
      >
        <span className="pointer-events-none absolute -right-3 -top-3 h-7 w-7 rounded-full bg-sand-400/25 blur-[2px]" />
        <span
          className="relative -mt-0.5 text-[1.55rem] leading-none"
          style={{ fontFamily: '"Noto Sans Devanagari", "Inter", serif' }}
        >
          ॐ
        </span>
      </span>

      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            'font-display text-[1.0625rem] font-semibold leading-tight tracking-[-0.03em]',
            variant === 'light' ? 'text-ink' : 'text-white'
          )}
        >
          {name}
        </span>
        {showTagline && (
          <span
            className={cn(
              'mt-0.5 text-[0.6875rem] font-medium tracking-[0.02em]',
              variant === 'light' ? 'text-brand-600' : 'text-brand-200/80'
            )}
          >
            {tagline}
          </span>
        )}
      </span>
    </Link>
  );
}
