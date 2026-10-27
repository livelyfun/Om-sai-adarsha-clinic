import React from 'react';
import Link from 'next/link';
import { ArrowRight, Home, Stethoscope } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-4 text-center">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35]" />
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />

      <div className="relative w-full max-w-md">
        <p className="font-display text-[6rem] font-semibold leading-none tracking-tighter text-brand-900">
          404
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
          The requested page could not be found. Please check the URL or return to the clinic
          homepage.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <Link href="/en" className="btn btn-primary text-xs">
            <Home className="h-3.5 w-3.5" />
            Return to homepage
          </Link>
          <Link href="/en/doctors" className="btn btn-outline text-xs">
            <Stethoscope className="h-3.5 w-3.5" />
            Browse doctors
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
