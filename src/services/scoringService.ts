import { evaluateCompetitionScore } from '../lib/domain/scoring';
import type { Competition } from '../lib/domain/types';
import { getActiveScoringModel } from './dataSource';

export function getScoringModel() {
  return getActiveScoringModel();
}

export function getCompetitionEvaluation(competition: Competition) {
  return evaluateCompetitionScore(competition, getActiveScoringModel());
}

export function getModelWeights(): Array<{ id: string; name: string; weight: number }> {
  const model = getActiveScoringModel();
  return model.dimensions.map((dimension) => ({
    id: dimension.id,
    name: dimension.name,
    weight: dimension.weight,
  }));
}
