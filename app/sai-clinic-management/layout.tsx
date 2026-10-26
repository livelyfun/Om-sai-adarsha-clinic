import React from 'react';
import { headers } from 'next/headers';
import { getAuthContext } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import StaffTopBar from '@/components/cms/StaffTopBar';

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

interface CmsLayoutProps {
  children: React.ReactNode;
}

export default async function CmsLayout({ children }: CmsLayoutProps) {
  const auth = await getAuthContext();
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';

  // Allow login page without redirect loops
  // In Next.js App Router, the login page inside the group/route can be accessed
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* If authenticated as staff, show top bar */}
      {auth.user && auth.isStaff && (
        <StaffTopBar user={auth.user} isSuperAdmin={auth.isSuperAdmin} />
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
}
