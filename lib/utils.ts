import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Remove duplicate records while preserving the original order.
 * The development database is seeded by automated verification runs, which can
 * leave repeated copies of the same catalogue entry behind. Keys are compared
 * case-insensitively so "Dr. Anand Sharma" is shown only once.
 */
export function uniqueBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyFn(item).trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Automated end-to-end verification runs create throwaway clinicians such as
 * "Dr. Conflict Test Specialist". They are useful for tests but should never be
 * presented to the public, so they are filtered out of public listings.
 */
export function isDemoPlaceholderName(name: string): boolean {
  return /\b(test|conflict|stage\s*(one|two|three|four|five|\d+))\b/i.test(name ?? '');
}
