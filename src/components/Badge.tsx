import type { ReactNode } from 'react';
import { cn } from '../lib/utils/cn';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'accent';

const TONES: Record<Tone, string> = {
  neutral: 'border-line bg-surface-muted text-ink-700',
  success: 'border-success-700/20 bg-success-100 text-success-700',
  warning: 'border-warning-700/20 bg-warning-100 text-warning-700',
  danger: 'border-danger-700/20 bg-danger-100 text-danger-700',
  info: 'border-info-700/20 bg-info-100 text-info-700',
  brand: 'border-brand-500/20 bg-brand-50 text-brand-700',
  accent: 'border-accent-500/20 bg-accent-100 text-accent-700',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
