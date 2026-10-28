import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  tone = 'light',
  className,
}: SectionHeadingProps) {
  const centered = align === 'center';

  return (
    <div
      className={cn(
        'mb-7 gap-4 sm:mb-9 sm:gap-5 md:mb-11',
        centered
          ? 'mx-auto flex max-w-2xl flex-col items-center text-center'
          : 'flex flex-col',
        className
      )}
    >
      <div
        className={cn(
          'flex flex-col',
          !centered && 'sm:flex-row sm:items-end sm:justify-between sm:gap-5',
          centered && 'max-w-2xl items-center space-y-3'
        )}
      >
        <div className={cn('max-w-2xl', centered && 'space-y-3')}>
          {eyebrow && (
            <span className={cn('eyebrow', tone === 'dark' && 'text-sand-300')}>
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  tone === 'dark' ? 'bg-sand-400' : 'bg-brand-500'
                )}
              />
              {eyebrow}
            </span>
          )}
          <h2
            className={cn(
              'display-title mt-2.5 text-[1.875rem] sm:mt-3 sm:text-3xl md:text-[2.5rem]',
              tone === 'dark' && 'text-white'
            )}
          >
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                'mt-2.5 max-w-xl text-sm leading-relaxed sm:mt-3 sm:text-[0.9375rem]',
                centered && 'mx-auto',
                tone === 'dark' ? 'text-brand-100/80' : 'text-slate-600'
              )}
            >
              {description}
            </p>
          )}
        </div>
        {action && <div className="mt-4 shrink-0 sm:mt-0">{action}</div>}
      </div>
    </div>
  );
}
