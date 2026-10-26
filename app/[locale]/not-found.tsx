import React from 'react';
import Link from 'next/link';

export default function LocalizedNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs space-y-4">
        <h2 className="text-2xl font-serif font-bold text-slate-900">
          ४०४ — पृष्ठ फेला परेन / 404 Not Found
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          तपाईंले खोज्नुभएको पृष्ठ फेला परेन। कृपया मुख्य पृष्ठमा जानुहोस्।
          <br />
          The page you requested could not be found. Please return to the homepage.
        </p>
        <div className="pt-2">
          <Link
            href="/en"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-800 hover:bg-teal-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
