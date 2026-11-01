import { evaluateCompetitionScore, type ScoreOptions } from './scoring';
import type { Competition, ScoringModel } from './types';

export interface RankedCompetition {
  competition: Competition;
  score: number;
  rank: number;
  tied: boolean;
  coverage: number;
  confidence: 'high' | 'medium' | 'low' | null;
}

export interface ExcludedCompetition {
  competition: Competition;
  status: 'provisional' | 'ineligible';
  reasons: string[];
  provisionalScore: number | null;
  coverage: number;
}

export interface RankingResult {
  model: ScoringModel;
  entries: RankedCompetition[];
  excluded: ExcludedCompetition[];
  totalEvaluated: number;
}

export interface RankingOptions extends ScoreOptions {
  domain?: string | null;
}

const EPSILON = 1e-9;

export function rankCompetitions(
  competitions: Competition[],
  model: ScoringModel,
  options: RankingOptions = {},
): RankingResult {
  const filtered = options.domain
    ? competitions.filter((competition) => competition.domains.includes(options.domain ?? ''))
    : competitions;

  const evaluated = filtered.map((competition) => ({
    competition,
    evaluation: evaluateCompetitionScore(competition, model, options),
  }));

  const official = evaluated
    .filter(
      (item): item is typeof item & { evaluation: { officialScore: number } } =>
        item.evaluation.status === 'official' && item.evaluation.officialScore !== null,
    )
    .sort((a, b) => {
      const difference = b.evaluation.officialScore - a.evaluation.officialScore;
      if (Math.abs(difference) > EPSILON) return difference;
      return a.competition.id.localeCompare(b.competition.id);
    });

  const rankCounts = new Map<number, number>();
  const entries: RankedCompetition[] = [];
  let previousScore: number | null = null;
  let currentRank = 0;

  official.forEach((item, index) => {
    const score = item.evaluation.officialScore;
    if (previousScore === null || Math.abs(score - previousScore) > EPSILON) {
      currentRank = index + 1;
    }
    previousScore = score;
    rankCounts.set(currentRank, (rankCounts.get(currentRank) ?? 0) + 1);
    entries.push({
      competition: item.competition,
      score,
      rank: currentRank,
      tied: false,
      coverage: item.evaluation.coverage,
      confidence: item.evaluation.confidence,
    });
  });

  for (const entry of entries) {
    entry.tied = (rankCounts.get(entry.rank) ?? 0) > 1;
  }

  const excluded: ExcludedCompetition[] = evaluated
    .filter((item) => item.evaluation.status !== 'official')
    .map((item) => ({
      competition: item.competition,
      status: item.evaluation.status === 'provisional' ? 'provisional' : 'ineligible',
      reasons: item.evaluation.reasons,
      provisionalScore: item.evaluation.weightedScore,
      coverage: item.evaluation.coverage,
    }));

  return {
    model,
    entries,
    excluded,
    totalEvaluated: filtered.length,
  };
}
