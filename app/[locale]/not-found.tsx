import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Home, Stethoscope, FlaskConical } from 'lucide-react';

export default function LocalizedNotFound() {
  return (
    <div className="relative overflow-hidden bg-cream">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35]" />
      <div className="container-x relative flex min-h-[70vh] max-w-3xl flex-col items-center justify-center py-16 text-center sm:py-20">
        <p className="font-display text-[5.5rem] font-semibold leading-none tracking-tighter text-brand-900 sm:text-[7rem]">
          404
        </p>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          पृष्ठ फेला परेन
          <span className="mt-1 block text-base font-medium text-slate-500">
            Page not found
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-600">
          तपाईंले खोज्नुभएको पृष्ठ सारिएको वा हटाइएको हुन सक्छ। तलका विकल्पबाट जारी राख्नुहोस्।
          <br />
          <span className="text-xs text-slate-500">
            The page may have moved or been removed. Continue with one of the options below.
          </span>
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <Link href="/en" className="btn btn-primary text-xs">
            <Home className="h-3.5 w-3.5" />
            Homepage
          </Link>
          <Link href="/en/book" className="btn btn-outline text-xs">
            Book a session
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-12 grid w-full gap-3 sm:grid-cols-3">
          {[
            { icon: Stethoscope, label: 'Doctors', href: '/en/doctors' },
            { icon: FlaskConical, label: 'Lab tests', href: '/en/lab-tests' },
            { icon: Compass, label: 'Explore', href: '/en/explore/about' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-center gap-3 rounded-2xl border border-brand-950/8 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-sm"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <item.icon className="h-4 w-4" />
              </span>
              <span className="flex-1 text-xs font-semibold text-ink">{item.label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
