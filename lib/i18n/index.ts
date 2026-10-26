import enMessages from '@/messages/en.json';
import neMessages from '@/messages/ne.json';

export type Locale = 'en' | 'ne';
export const LOCALES: Locale[] = ['en', 'ne'];
export const DEFAULT_LOCALE: Locale = 'en';

export function getMessages(locale: Locale = 'en') {
  return locale === 'ne' ? neMessages : enMessages;
}

export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

/**
 * Unified Date and Time Formatter.
 * Always formats in Asia/Kathmandu timezone (UTC+5:45).
 * Display is currently Gregorian (AD), routed through this single helper
 * so Bikram Sambat (BS) conversion can be attached transparently.
 */
export function formatClinicDateTime(
  dateInput: string | Date,
  locale: Locale = 'en',
  options: { includeTime?: boolean; format?: 'short' | 'full' } = {}
): string {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';

    const opts: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kathmandu',
      year: 'numeric',
      month: options.format === 'short' ? 'short' : 'long',
      day: 'numeric',
      ...(options.includeTime && {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };

    return new Intl.DateTimeFormat(locale === 'ne' ? 'ne-NP' : 'en-US', opts).format(date);
  } catch {
    return String(dateInput);
  }
}
