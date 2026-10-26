import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Om Sai Aadarsha Clinic | ॐ साई आदर्श क्लिनिक',
  description: 'Bilingual (English / Nepali) healthcare portal, request-based booking system, secure lab reports, and clinic management CMS for Om Sai Aadarsha Clinic.',
  openGraph: {
    title: 'Om Sai Aadarsha Clinic | ॐ साई आदर्श क्लिनिक',
    description: 'Bilingual (English / Nepali) healthcare portal, request-based booking system, secure lab reports, and clinic management CMS for Om Sai Aadarsha Clinic.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Om Sai Aadarsha Clinic | ॐ साई आदर्श क्लिनिक',
    description: 'Bilingual (English / Nepali) healthcare portal, request-based booking system, secure lab reports, and clinic management CMS for Om Sai Aadarsha Clinic.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
