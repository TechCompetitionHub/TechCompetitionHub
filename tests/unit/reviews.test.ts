import { describe, expect, it } from 'vitest';
import {
  isPublicCommunityReview,
  ratingStars,
  sortCommunityReviews,
  summarizeCommunityRatings,
} from '../../src/lib/domain/reviews';
import { communityReviewSchema, type CommunityReview } from '../../src/lib/domain/schemas';

function review(overrides: Partial<CommunityReview> = {}): CommunityReview {
  return communityReviewSchema.parse({
    schema_version: '1.0.0',
    is_example: false,
    id: 'review-1',
    competition_id: 'cumcm',
    rating: 4,
    participated: true,
    track: '本科组',
    year: 2025,
    school: '示例大学',
    role: 'participant',
    public_profile: null,
    review: '这是一条用于测试聚合逻辑的社区评价，长度足够通过校验。',
    evidence_url: null,
    consent_public: true,
    verification_status: 'approved',
    submitted_at: '2026-11-01',
    reviewed_at: '2026-11-01',
    notes: null,
    ...overrides,
  });
}

describe('社区评分聚合', () => {
  it('计算平均分、样本量与分布', () => {
    const summary = summarizeCommunityRatings([
      review({ id: 'review-1', rating: 5 }),
      review({ id: 'review-2', rating: 4 }),
      review({ id: 'review-3', rating: 4 }),
    ]);
    expect(summary.count).toBe(3);
    expect(summary.average).toBeCloseTo(13 / 3, 5);
    expect(summary.distribution[5]).toBe(1);
    expect(summary.distribution[4]).toBe(2);
    expect(summary.distribution[1]).toBe(0);
  });

  it('只聚合已审核、同意公开且非示例的记录', () => {
    const summary = summarizeCommunityRatings([
      review({ id: 'approved', rating: 5 }),
      review({ id: 'pending', rating: 1, verification_status: 'pending', reviewed_at: null }),
      review({ id: 'no-consent', rating: 1, consent_public: false }),
      review({ id: 'example', rating: 1, is_example: true }),
    ]);
    expect(summary.count).toBe(1);
    expect(summary.average).toBe(5);
  });

  it('没有公开评价时平均分为 null', () => {
    expect(summarizeCommunityRatings([])).toEqual({
      count: 0,
      average: null,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
  });

  it('按提交日期倒序排列，日期相同按 ID 稳定排序', () => {
    const reviews = [
      review({ id: 'b', submitted_at: '2026-10-01' }),
      review({ id: 'a', submitted_at: '2026-10-01' }),
      review({ id: 'c', submitted_at: '2026-11-01' }),
    ];
    expect(sortCommunityReviews(reviews).map((item) => item.id)).toEqual(['c', 'a', 'b']);
  });

  it('公开判定与星级展示', () => {
    expect(isPublicCommunityReview(review())).toBe(true);
    expect(isPublicCommunityReview(review({ consent_public: false }))).toBe(false);
    expect(ratingStars(4)).toBe('★★★★☆');
    expect(ratingStars(0)).toBe('★☆☆☆☆');
    expect(ratingStars(9)).toBe('★★★★★');
  });
});
