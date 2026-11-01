import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { ButtonLink } from '../../components/Button';
import { ExternalLink } from '../../components/ExternalLink';
import { EmptyState } from '../../components/States';
import { formatDate } from '../../lib/utils/format';
import { ratingStars, type CommunityRatingSummary } from '../../lib/domain/reviews';
import type { CommunityReview } from '../../lib/domain/types';
import {
  getCompetitionRatingSummary,
  getReviewsForCompetition,
} from '../../services/reviewService';

const ROLE_LABELS: Record<CommunityReview['role'], string> = {
  participant: '参赛队员',
  team_lead: '队长/负责人',
  advisor: '指导教师',
  organizer: '组织者',
  observer: '关注者/未参赛',
};

function ReviewCard({ review }: { review: CommunityReview }) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-semibold text-accent-700"
            aria-label={`评分 ${review.rating} / 5`}
          >
            {ratingStars(review.rating)}
          </span>
          <Badge tone={review.participated ? 'success' : 'neutral'}>
            {review.participated ? '参加过' : '未参加'}
          </Badge>
        </div>
        <span className="text-xs text-ink-500">提交于 {formatDate(review.submitted_at)}</span>
      </div>

      <div className="mt-2 grid gap-x-4 gap-y-1 text-xs text-ink-500 sm:grid-cols-2">
        <p>
          角色：<span className="text-ink-700">{ROLE_LABELS[review.role]}</span>
        </p>
        <p>
          赛道：<span className="text-ink-700">{review.track ?? '未填写'}</span>
        </p>
        <p>
          年份：<span className="text-ink-700">{review.year ?? '未填写'}</span>
        </p>
        <p>
          学校：<span className="text-ink-700">{review.school ?? '未公开'}</span>
        </p>
        <p>
          公开主页：
          <span className="text-ink-700">
            {review.public_profile ? (
              /^https?:\/\//i.test(review.public_profile) ? (
                <ExternalLink href={review.public_profile} className="text-xs">
                  查看
                </ExternalLink>
              ) : (
                review.public_profile
              )
            ) : (
              '未提供'
            )}
          </span>
        </p>
      </div>

      <p className="mt-2 text-sm leading-6 whitespace-pre-line text-ink-700">{review.review}</p>
      {review.evidence_url ? (
        <p className="mt-2 text-xs">
          <ExternalLink href={review.evidence_url} className="text-xs">
            公开证据链接
          </ExternalLink>
        </p>
      ) : null}
    </article>
  );
}

function Summary({ summary }: { summary: CommunityRatingSummary }) {
  return (
    <div className="rounded-xl border border-line bg-surface-muted p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-ink-500">社区平均分（自述）</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-ink-900">{summary.average?.toFixed(1)}</span>
            <span className="text-xs text-ink-500">/ 5 · {summary.count} 条已审核评价</span>
          </p>
          <p className="mt-1 text-sm text-accent-700" aria-hidden="true">
            {ratingStars(summary.average ?? 0)}
          </p>
        </div>
        <ButtonLink to="/submit-review" variant="secondary" size="sm">
          提交参赛评价
        </ButtonLink>
      </div>

      <div className="mt-4 space-y-1.5">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = summary.distribution[rating as 1 | 2 | 3 | 4 | 5];
          const percent = summary.count > 0 ? (count / summary.count) * 100 : 0;
          return (
            <div key={rating} className="flex items-center gap-2 text-xs text-ink-500">
              <span className="w-6">{rating} 星</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-accent-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-6 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CommunityRatingPanel({ competitionId }: { competitionId: string }) {
  const reviews = getReviewsForCompetition(competitionId);
  const summary = getCompetitionRatingSummary(competitionId);

  if (reviews.length === 0) {
    return (
      <EmptyState
        compact
        title="暂无已审核的社区评分"
        description="社区评分来自参赛者自述，需要审核后才会公开展示。你可以提交是否参加过、赛道、年份、学校与公开主页；平台不会把这些信息当作已验证事实，也不会用社区评分替代平台评分或排名。"
        action={
          <ButtonLink to={`/submit-review?competition=${competitionId}`}>提交参赛评价</ButtonLink>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <Summary summary={summary} />
      <ul className="space-y-3">
        {reviews.map((review) => (
          <li key={review.id}>
            <ReviewCard review={review} />
          </li>
        ))}
      </ul>
      <p className="text-xs leading-5 text-ink-500">
        社区评分是用户自述，未验证参赛经历；它不参与平台六维评分，也不进入正式排行榜。请勿在评价中填写手机号、身份证或真实姓名。需要纠错可走{' '}
        <Link to="/data-policy" className="link-inline">
          数据政策
        </Link>
        。
      </p>
    </div>
  );
}
