'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FaqItem {
  q: string;
  a: string;
}

interface HomeFaqAccordionProps {
  faqs: FaqItem[];
}

export function HomeFaqAccordion({ faqs }: HomeFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="divide-y divide-brand-950/10 border-y border-brand-950/10">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx}>
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="group flex w-full items-start justify-between gap-5 py-5 text-left"
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${idx}`}
            >
              <span
                className={cn(
                  'font-display text-[0.9375rem] font-semibold tracking-tight transition-colors sm:text-base',
                  isOpen ? 'text-brand-900' : 'text-ink group-hover:text-brand-800'
                )}
              >
                {faq.q}
              </span>
              <span
                className={cn(
                  'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300',
                  isOpen
                    ? 'rotate-45 border-brand-800 bg-brand-800 text-white'
                    : 'border-brand-950/15 bg-white text-brand-700 group-hover:border-brand-300'
                )}
              >
                <Plus className="h-3.5 w-3.5" />
              </span>
            </button>
            <div
              id={`faq-panel-${idx}`}
              className={cn(
                'grid transition-all duration-300 ease-out',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-5 pr-10 text-[0.8125rem] leading-relaxed text-slate-600">
                  {faq.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
