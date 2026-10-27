import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

/**
 * Editorial page banner used across the public directories. Keeps the inner
 * pages visually anchored to the homepage without repeating the hero.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  children,
  align = 'center',
  className,
}: PageHeaderProps) {
  const centered = align === 'center';

  return (
    <section className={cn('relative overflow-hidden border-b border-brand-900/10 bg-cream', className)}>
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 mask-fade-b" />
      <div className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-sand-200/50 blur-3xl" />

      <div
        className={cn(
          'container-x relative py-12 sm:py-16',
          centered ? 'text-center' : 'text-left'
        )}
      >
        <div className={cn('mx-auto max-w-3xl', centered && 'flex flex-col items-center')}>
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            {eyebrow}
          </span>
          <h1 className="display-title mt-4 text-4xl sm:text-[3.25rem]">{title}</h1>
          {description && (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              {description}
            </p>
          )}
          {children && <div className="mt-7 w-full">{children}</div>}
        </div>
      </div>
    </section>
  );
}
