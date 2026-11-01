import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils/cn';

export function ExternalLink({
  href,
  children,
  className,
  showIcon = true,
  ...rest
}: {
  href: string;
  children: ReactNode;
  className?: string;
  showIcon?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('link-inline inline-flex items-center gap-1', className)}
      {...rest}
    >
      {children}
      {showIcon ? (
        <>
          <span aria-hidden="true" className="text-[0.8em]">
            ↗
          </span>
          <span className="sr-only">（在新标签页打开）</span>
        </>
      ) : null}
    </a>
  );
}
