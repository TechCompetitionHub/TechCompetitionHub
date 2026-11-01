import type { ReactNode } from 'react';
import { cn } from '../lib/utils/cn';

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-2xl border border-line bg-surface shadow-card', className)}>
      {children}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('p-5 sm:p-6', className)}>{children}</div>;
}

export function CardTitle({
  as: Tag = 'h3',
  className,
  children,
}: {
  as?: 'h2' | 'h3' | 'h4';
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cn('text-lg font-semibold text-ink-900', className)}>{children}</Tag>;
}
