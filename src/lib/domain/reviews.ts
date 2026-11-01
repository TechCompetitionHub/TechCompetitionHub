import type { CommunityReview } from './types';

export interface CommunityRatingSummary {
  count: number;
  average: number | null;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

const EMPTY_DISTRIBUTION: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
};

export function isPublicCommunityReview(review: CommunityReview): boolean {
  return !review.is_example && review.consent_public && review.verification_status === 'approved';
}

export function summarizeCommunityRatings(reviews: CommunityReview[]): CommunityRatingSummary {
  const publicReviews = reviews.filter(isPublicCommunityReview);
  const distribution = { ...EMPTY_DISTRIBUTION };
  let total = 0;

  for (const review of publicReviews) {
    distribution[review.rating as 1 | 2 | 3 | 4 | 5] += 1;
    total += review.rating;
  }

  return {
    count: publicReviews.length,
    average: publicReviews.length > 0 ? total / publicReviews.length : null,
    distribution,
  };
}

export function sortCommunityReviews(reviews: CommunityReview[]): CommunityReview[] {
  return [...reviews].sort((a, b) => {
    const byDate = b.submitted_at.localeCompare(a.submitted_at);
    if (byDate !== 0) return byDate;
    return a.id.localeCompare(b.id);
  });
}

export function ratingStars(rating: number): string {
  const rounded = Math.max(1, Math.min(5, Math.round(rating)));
  return `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`;
}
