import { notFound } from 'next/navigation';

/**
 * Catch-all for unknown paths inside a locale segment.
 *
 * Without this file Next.js renders the bare root `app/not-found.tsx`, which has
 * no clinic navigation. Routing through here makes the localized not-found page
 * render inside the public header and footer.
 */
export default function LocaleCatchAll() {
  notFound();
}
