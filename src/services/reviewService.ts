import type { CommunityReview } from '../lib/domain/types';
import {
  isPublicCommunityReview,
  sortCommunityReviews,
  summarizeCommunityRatings,
  type CommunityRatingSummary,
} from '../lib/domain/reviews';
import { dataset } from './dataSource';

export function listApprovedReviews(): CommunityReview[] {
  return sortCommunityReviews(dataset.reviews.filter(isPublicCommunityReview));
}

export function getReviewsForCompetition(competitionId: string): CommunityReview[] {
  return sortCommunityReviews(
    dataset.reviews.filter(
      (review) => review.competition_id === competitionId && isPublicCommunityReview(review),
    ),
  );
}

export function getCompetitionRatingSummary(competitionId: string): CommunityRatingSummary {
  return summarizeCommunityRatings(getReviewsForCompetition(competitionId));
}

export function countApprovedReviews(): number {
  return listApprovedReviews().length;
}

export function getLatestReviews(limit = 5): CommunityReview[] {
  return listApprovedReviews().slice(0, limit);
}
