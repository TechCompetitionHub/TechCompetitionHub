import { Link } from 'react-router-dom';
import type { RankedCompetition } from '../../lib/domain/ranking';
import { formatDate, formatPercent, formatScore } from '../../lib/utils/format';
import { Badge } from '../../components/Badge';
import { ScoreBar } from '../../components/ScoreBar';
import { getScoringModel } from '../../services/scoringService';

export function RankingEntry({
  entry,
  showDimensions = true,
}: {
  entry: RankedCompetition;
  showDimensions?: boolean;
}) {
  const model = getScoringModel();
  return (
    <article className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy-900 text-base font-bold text-white">
          {entry.rank}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-ink-900">
              <Link to={`/competitions/${entry.competition.id}`} className="hover:text-brand-700">
                {entry.competition.name}
              </Link>
            </h3>
            {entry.tied ? <Badge tone="info">并列 {entry.rank}</Badge> : null}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-ink-500">{entry.competition.summary}</p>
          <p className="mt-2 text-xs text-ink-500">
            核验 {formatDate(entry.competition.last_verified_at)} · 证据置信度{' '}
            {entry.confidence ?? '未知'} · 覆盖率 {formatPercent(entry.coverage)}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl font-bold text-brand-700">{formatScore(entry.score)}</p>
          <p className="text-[11px] text-ink-500">平台初评 / 100</p>
        </div>
      </div>

      {showDimensions ? (
        <details className="mt-4 border-t border-line pt-3">
          <summary className="cursor-pointer text-sm font-semibold text-brand-700">
            查看维度分与说明
          </summary>
          <div className="mt-4 space-y-4">
            {model.dimensions.map((dimension) => {
              const dimensionScore = entry.competition.scores?.dimension_scores[dimension.id];
              if (!dimensionScore) return null;
              return (
                <ScoreBar
                  key={dimension.id}
                  name={dimension.name}
                  score={dimensionScore.score}
                  weight={dimension.weight}
                  rationale={`${dimensionScore.rationale}（证据等级：${dimensionScore.evidence_level}）`}
                />
              );
            })}
          </div>
        </details>
      ) : null}
    </article>
  );
}
