'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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
    <div className="space-y-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="rounded-xl border border-slate-200/80 bg-white transition-colors duration-150 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between gap-4 p-5 text-left font-medium text-slate-900 hover:text-teal-900 transition-colors focus-visible:outline-teal-800"
              aria-expanded={isOpen}
            >
              <span className="text-base font-semibold">{faq.q}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-teal-800' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
