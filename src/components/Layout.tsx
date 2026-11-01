import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils/cn';

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}>{children}</div>
  );
}

export function Section({
  className,
  children,
  labelledBy,
}: {
  className?: string;
  children: ReactNode;
  labelledBy?: string;
}) {
  return (
    <section className={cn('py-10 sm:py-14', className)} aria-labelledby={labelledBy}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-brand-700 uppercase">
            <span aria-hidden="true" className="section-rule h-px w-6" />
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={id}
          className="text-balance text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl"
        >
          {title}
        </h2>
        {description ? <p className="mt-2 text-sm leading-6 text-ink-500">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="page-header-glow relative overflow-hidden border-b border-line">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"
      />
      <Container className="relative py-8 sm:py-12">
        {eyebrow ? (
          <p className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-brand-700 uppercase">
            <span aria-hidden="true" className="section-rule h-px w-6" />
            {eyebrow}
          </p>
        ) : null}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 text-base leading-7 text-ink-500">{description}</p>
            ) : null}
            {meta ? <div className="mt-4">{meta}</div> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </Container>
    </div>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; to?: string }> }) {
  return (
    <nav aria-label="面包屑" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.to ? (
              <Link to={item.to} className="hover:text-brand-700 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-ink-700">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
