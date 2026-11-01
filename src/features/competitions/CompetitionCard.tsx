import { Link } from 'react-router-dom';
import type { Competition } from '../../lib/domain/types';
import { equipmentLabel } from '../../lib/domain/equipment';
import { formatDate, formatScore, statusLabel } from '../../lib/utils/format';
import { getAudienceLabel, getDomainLabel } from '../../services/competitionService';
import { Badge } from '../../components/Badge';
import { StatusBadge } from '../../components/StatusBadge';
import { cn } from '../../lib/utils/cn';

export function CompetitionCard({
  competition,
  score,
  rank,
  className,
}: {
  competition: Competition;
  score?: number | null;
  rank?: number;
  className?: string;
}) {
  const teamLabel = competition.format.team_based
    ? competition.format.team_size
      ? `团队赛 ${competition.format.team_size.min}–${competition.format.team_size.max} 人`
      : '团队赛'
    : '个人赛';

  return (
    <article
      className={cn(
        'card-hover group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-card',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={competition.verification_status} />
          {competition.domains.slice(0, 2).map((domain) => (
            <Badge key={domain} tone="brand">
              {getDomainLabel(domain)}
            </Badge>
          ))}
          <Badge tone="neutral">{equipmentLabel(competition.equipment.type)}</Badge>
        </div>
        {rank ? (
          <span className="rounded-full bg-gradient-to-br from-navy-800 to-navy-900 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            #{rank}
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 text-lg leading-snug font-bold text-ink-900">
        <Link
          to={`/competitions/${competition.id}`}
          className="transition-colors hover:text-brand-700"
        >
          {competition.name}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-ink-500">
        {competition.summary}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-ink-500">
        <div>
          <span className="sr-only">参赛形式</span>
          <span>{teamLabel}</span>
        </div>
        <div>
          <span className="sr-only">适合对象</span>
          <span>{competition.audience.levels.map(getAudienceLabel).join(' / ')}</span>
        </div>
        <div>
          <span className="sr-only">难度</span>
          <span>
            难度 {'★'.repeat(competition.difficulty.level)}
            {'☆'.repeat(5 - competition.difficulty.level)}
          </span>
        </div>
        <div>
          <span className="sr-only">最后核验</span>
          <span>核验 {formatDate(competition.last_verified_at)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
        <span className="text-ink-500">
          {competition.scores
            ? `平台评分 ${formatScore(score ?? competition.scores.weighted_score)}`
            : '暂无平台评分'}
        </span>
        {competition.scores ? (
          <span className="text-ink-500">
            {statusLabel(competition.verification_status)} · 非官方排名
          </span>
        ) : (
          <span className="text-ink-500">资料待补充</span>
        )}
      </div>
    </article>
  );
}
