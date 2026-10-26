import React from 'react';
import { getMessages, Locale } from '@/lib/i18n';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPolicyPage({ params }: PrivacyPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      {/* Draft Warning Banner (Section 13) */}
      <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 flex items-start gap-3 text-xs text-amber-950">
        <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">DRAFT DOCUMENT — VERSION 2026-10-v1</p>
          <p className="mt-0.5 text-amber-900">
            This privacy policy is a development draft prepared for application architecture testing. It requires official review by Om Sai Aadarsha Clinic leadership and qualified legal counsel before production launch.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="font-serif text-3xl font-bold text-slate-900">
          {locale === 'ne' ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy & Patient Data Protection'}
        </h1>
        <p className="text-xs text-slate-500">Effective Date: October 26, 2026 · Version: 2026-10-v1</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-bold text-slate-900 text-base">1. Scope and Commitment</h2>
          <p>
            Om Sai Aadarsha Clinic recognizes the fundamental privacy rights of patients under applicable healthcare guidelines and the Individual Privacy Act (2018) of Nepal. This policy governs how we collect, store, and transmit your personal identification and clinical diagnostic information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-slate-900 text-base">2. Information We Collect</h2>
          <p>
            We collect only information necessary to deliver clinical care and verify appointments:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Account Identity:</strong> Full legal name, email address, mobile phone number, and hashed authentication credentials.</li>
            <li><strong>Patient Profiles:</strong> Date of birth, sex, phone number, and relationship label for registered family members.</li>
            <li><strong>Booking Data:</strong> Preferred consultation dates, slot selections, symptoms notes, and line-item lab requests.</li>
            <li><strong>Audit Logs:</strong> Timestamps, IP addresses, and user identifiers for sensitive actions (sign-ins, report downloads, password resets).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-slate-900 text-base">3. Laboratory Report Security & Access Control</h2>
          <p>
            Laboratory reports delivered through this platform are strictly confidential:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Reports are stored behind authenticated server barriers and never published under public URLs.</li>
            <li>Only released reports belonging to a profile managed by your verified account can be viewed or downloaded.</li>
            <li>Staff access is governed by strict role-based authorization keys and logged in an immutable audit ledger.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-slate-900 text-base">4. Data Retention & Policy Queries</h2>
          <p>
            In accordance with clinic retention rules, clinical and audit records are retained for patient history and clinical continuity. For inquiries regarding your records, please contact clinic reception in person.
          </p>
        </section>
      </div>
    </div>
  );
}
