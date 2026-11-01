import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { cn } from '../lib/utils/cn';
import { SITE } from '../services/site';

const NAV_ITEMS = [
  { to: '/', label: '首页', end: true },
  { to: '/competitions', label: '找竞赛' },
  { to: '/rankings', label: '排行榜' },
  { to: '/projects', label: '项目成果' },
  { to: '/skills', label: '技能图谱' },
  { to: '/planner', label: '成长规划' },
  { to: '/forum', label: '论坛' },
  { to: '/contribute', label: '参与贡献' },
] as const;

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="TechCompetitionHub 首页">
      <span className="flex size-9 overflow-hidden rounded-xl bg-navy-900 shadow-sm ring-1 ring-black/5">
        <img
          src={`${import.meta.env.BASE_URL}forum-avatar.jpg`}
          alt=""
          width={36}
          height={36}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold tracking-tight text-ink-900 transition-colors group-hover:text-brand-700">
          TechCompetitionHub
        </span>
        <span className="hidden text-[11px] text-ink-500 sm:block">大学生科技竞赛成长平台</span>
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const firstLink = panelRef.current?.querySelector<HTMLAnchorElement>('a');
    firstLink?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-xl transition-[box-shadow,background-color,border-color] duration-300',
        scrolled && 'border-line-strong/70 bg-surface/95 shadow-[0_10px_30px_rgba(16,33,43,0.07)]',
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="主导航" className="hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-[inset_0_0_0_1px_rgba(22,133,127,0.10)]'
                    : 'text-ink-700 hover:bg-surface-muted hover:text-ink-900',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={SITE.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-semibold text-ink-700 hover:border-brand-500 hover:text-brand-700 sm:inline-flex"
          >
            GitHub
            <span aria-hidden="true" className="ml-1 text-xs">
              ↗
            </span>
            <span className="sr-only">（在新标签页打开）</span>
          </a>
          <button
            ref={buttonRef}
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-line-strong text-ink-700 hover:bg-surface-muted lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? '关闭菜单' : '打开菜单'}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true" className="text-lg">
              {open ? '×' : '☰'}
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        ref={panelRef}
        hidden={!open}
        className={cn('border-t border-line bg-surface lg:hidden', open && 'fade-up')}
      >
        <nav aria-label="移动导航" className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <ul className="grid gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={'end' in item ? item.end : false}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-lg px-3 py-2.5 text-sm font-medium',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-ink-700 hover:bg-surface-muted',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <a
                href={SITE.discussions}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-surface-muted"
              >
                GitHub 论坛
                <span className="sr-only">（在新标签页打开）</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
