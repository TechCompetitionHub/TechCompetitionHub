import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { cn } from '../../lib/utils/cn';
import type { RankedCompetition } from '../../lib/domain/ranking';
import { formatScore } from '../../lib/utils/format';

type PodiumPosition = 1 | 2 | 3;

const PODIUM_STYLES = {
  1: {
    card: 'border-accent-500/40 shadow-[0_18px_50px_rgba(201,138,18,0.16)]',
    step: 'h-36 bg-gradient-to-b from-accent-500 to-accent-700 sm:h-44',
    label: '冠军',
  },
  2: {
    card: 'border-line-strong/80',
    step: 'h-24 bg-gradient-to-b from-slate-400 to-slate-600 sm:h-32',
    label: '亚军',
  },
  3: {
    card: 'border-line',
    step: 'h-16 bg-gradient-to-b from-amber-700/80 to-amber-900 sm:h-20',
    label: '季军',
  },
} as const;

function PodiumCard({ entry, position }: { entry: RankedCompetition; position: PodiumPosition }) {
  const style = PODIUM_STYLES[position];
  const order = position === 1 ? 'order-2' : position === 2 ? 'order-1' : 'order-3';

  return (
    <li className={cn('min-w-0', order)}>
      <article
        className={cn(
          'flex h-full flex-col overflow-hidden rounded-2xl border bg-surface shadow-card',
          style.card,
        )}
        aria-label={`第 ${position} 位：${entry.competition.name}，${formatScore(entry.score)} 分`}
      >
        <div className="flex flex-1 flex-col items-center px-2 py-4 text-center sm:px-4 sm:py-5">
          <Badge tone={position === 1 ? 'accent' : position === 2 ? 'neutral' : 'warning'}>
            {style.label}
          </Badge>
          <h3 className="mt-2 line-clamp-3 min-h-10 text-xs leading-5 font-bold text-ink-900 sm:text-sm">
            <Link to={`/competitions/${entry.competition.id}`} className="hover:text-brand-700">
              {entry.competition.name}
            </Link>
          </h3>
          <p className="mt-2 text-xl font-black tracking-tight text-ink-900 sm:text-3xl">
            {formatScore(entry.score)}
          </p>
          <p className="text-[10px] text-ink-500 sm:text-xs">平台初评 / 100</p>
        </div>
        <div
          className={cn(
            'flex items-center justify-center text-3xl font-black text-white/95 sm:text-4xl',
            style.step,
          )}
        >
          {position}
        </div>
      </article>
    </li>
  );
}

export function RankingPodium({ entries }: { entries: RankedCompetition[] }) {
  const top = entries.slice(0, 3);
  if (top.length === 0) return null;

  return (
    <ol className="grid grid-cols-3 items-end gap-2 sm:gap-4" aria-label="排行榜前三名领奖台">
      {top.map((entry, index) => (
        <PodiumCard
          key={entry.competition.id}
          entry={entry}
          position={(index + 1) as PodiumPosition}
        />
      ))}
    </ol>
  );
}
