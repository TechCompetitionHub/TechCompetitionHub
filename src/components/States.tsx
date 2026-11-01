import type { ReactNode } from 'react';
import { cn } from '../lib/utils/cn';

type Tone = 'info' | 'warning' | 'danger' | 'success' | 'neutral';

const TONES: Record<Tone, string> = {
  info: 'border-info-700/25 bg-info-100 text-info-700',
  warning: 'border-warning-700/25 bg-warning-100 text-warning-700',
  danger: 'border-danger-700/25 bg-danger-100 text-danger-700',
  success: 'border-success-700/25 bg-success-100 text-success-700',
  neutral: 'border-line bg-surface-muted text-ink-700',
};

const ICONS: Record<Tone, string> = {
  info: 'i',
  warning: '!',
  danger: '×',
  success: '✓',
  neutral: '•',
};

export function Alert({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-xl border p-4 text-sm leading-6', TONES[tone], className)}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold"
      >
        {ICONS[tone]}
      </span>
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? 'mt-1' : undefined}>{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  compact = false,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-line-strong bg-surface/70 text-center',
        compact ? 'px-4 py-8' : 'px-6 py-14',
      )}
    >
      <div
        aria-hidden="true"
        className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-brand-50 text-lg text-brand-700"
      >
        ◇
      </div>
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink-500">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function LoadingBlock({ label = '正在加载…' }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-xl border border-line bg-surface p-5"
    >
      <span className="size-3 animate-pulse rounded-full bg-brand-500" aria-hidden="true" />
      <span className="text-sm text-ink-500">{label}</span>
    </div>
  );
}
