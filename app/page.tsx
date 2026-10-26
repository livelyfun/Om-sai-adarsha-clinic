import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, isValidLocale } from '@/lib/i18n';

export default async function RootPage() {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get('osa_locale')?.value;
  const locale = savedLocale && isValidLocale(savedLocale) ? savedLocale : DEFAULT_LOCALE;

  redirect(`/${locale}`);
}
