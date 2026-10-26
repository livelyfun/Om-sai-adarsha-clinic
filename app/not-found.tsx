import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-md p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 font-serif">404 — Page Not Found</h2>
        <p className="text-xs text-slate-600">
          The requested page could not be found. Please check the URL or return to the clinic homepage.
        </p>
        <div className="pt-2">
          <Link
            href="/en"
            className="inline-flex items-center justify-center rounded-xl bg-teal-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-teal-900 shadow-xs"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
