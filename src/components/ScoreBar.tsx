import { cn } from '../lib/utils/cn';

export function ScoreBar({
  name,
  score,
  weight,
  rationale,
}: {
  name: string;
  score: number;
  weight: number;
  rationale?: string;
}) {
  const percent = Math.max(0, Math.min(100, score));
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-ink-900">{name}</span>
        <span className="text-xs text-ink-500">
          {score.toFixed(1)} / 100 · 权重 {(weight * 100).toFixed(0)}%
        </span>
      </div>
      <div
        role="meter"
        aria-label={`${name}得分`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${percent.toFixed(1)} 分，权重 ${(weight * 100).toFixed(0)}%`}
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className={cn(
            'h-full rounded-full',
            percent >= 80 ? 'bg-brand-600' : percent >= 60 ? 'bg-brand-500' : 'bg-accent-500',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {rationale ? <p className="mt-1.5 text-xs leading-5 text-ink-500">{rationale}</p> : null}
    </div>
  );
}
