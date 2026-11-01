import { Link } from 'react-router-dom';
import type { Competition } from '../../lib/domain/types';
import { evaluateCompetitionScore } from '../../lib/domain/scoring';
import { formatDate, formatScore } from '../../lib/utils/format';
import { getScoringModel } from '../../services/scoringService';
import { Alert } from '../../components/States';
import { Badge } from '../../components/Badge';
import { ScoreBar } from '../../components/ScoreBar';
import { ScoreStatusBadge } from '../../components/StatusBadge';

export function CompetitionScorePanel({ competition }: { competition: Competition }) {
  const model = getScoringModel();
  const evaluation = evaluateCompetitionScore(competition, model);
  const scores = competition.scores;

  if (!scores) {
    return (
      <Alert tone="neutral" title="暂无平台评分">
        该条目尚未完成平台评分，不会进入正式排行榜。竞赛事实仍可能已核验；评分需要维度依据、证据等级和复核记录。
        <span className="mt-2 block">
          <Link to="/scoring-method" className="link-inline">
            阅读评分方法与准入规则
          </Link>
        </span>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-ink-500 uppercase">平台评分</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-brand-700">
              {formatScore(evaluation.weightedScore)}
            </span>
            <span className="text-xs text-ink-500">/ 100 · 模型 v{model.version}</span>
          </p>
        </div>
        <ScoreStatusBadge status={evaluation.status} />
        <Badge tone="neutral">证据置信度 {scores.confidence_level}</Badge>
      </div>

      {evaluation.status !== 'official' ? (
        <Alert tone="warning" title="未进入正式排名" className="mt-4">
          <ul className="list-disc space-y-1 pl-5">
            {evaluation.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </Alert>
      ) : null}

      <div className="mt-6 space-y-5">
        {model.dimensions.map((dimension) => {
          const dimensionScore = scores.dimension_scores[dimension.id];
          if (!dimensionScore) {
            return (
              <div key={dimension.id}>
                <p className="text-sm font-semibold text-ink-900">{dimension.name}</p>
                <p className="mt-1 text-xs text-ink-500">缺失 · 不参与正式排名</p>
              </div>
            );
          }
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

      <p className="mt-5 text-sm leading-6 text-ink-500">{scores.evidence_summary}</p>

      <dl className="mt-5 grid gap-3 rounded-xl border border-line bg-surface-muted p-4 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-ink-500">评分状态</dt>
          <dd className="mt-1 font-semibold text-ink-900">
            {scores.review_status === 'approved'
              ? '平台初评已记录'
              : scores.review_status === 'in_review'
                ? '复核中'
                : '草稿'}
          </dd>
        </div>
        <div>
          <dt className="text-ink-500">复核记录</dt>
          <dd className="mt-1 font-semibold text-ink-900">
            {scores.reviewed_at ? formatDate(scores.reviewed_at) : '待补充'}
            {scores.reviewer_role ? ` · ${scores.reviewer_role}` : ''}
          </dd>
        </div>
        <div>
          <dt className="text-ink-500">评分覆盖率</dt>
          <dd className="mt-1 font-semibold text-ink-900">
            {Math.round(evaluation.coverage * 100)}%
          </dd>
        </div>
        <div>
          <dt className="text-ink-500">缺失维度</dt>
          <dd className="mt-1 font-semibold text-ink-900">
            {evaluation.missingDimensions.length > 0
              ? evaluation.missingDimensions.join('、')
              : '无'}
          </dd>
        </div>
      </dl>

      {scores.notes ? <p className="mt-3 text-xs leading-5 text-ink-500">{scores.notes}</p> : null}
      <p className="mt-4 text-xs leading-5 text-ink-500">
        平台评分是社区方法论下的编辑评估，不是官方排名、认证或对个人结果的预测。评分依据、权重和限制均公开；
        <Link to="/scoring-method" className="link-inline">
          查看评分方法
        </Link>
        。
      </p>
    </div>
  );
}
