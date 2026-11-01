import type { Competition, ScoringDimension, ScoringModel } from './types';

export type ScoreStatus = 'official' | 'provisional' | 'ineligible';

export interface ScoreEvaluation {
  status: ScoreStatus;
  /** 按已知维度重归一化后的加权分；0–100，无法计算时为 null */
  weightedScore: number | null;
  /** 仅当全部维度已知且满足准入时为正式分 */
  officialScore: number | null;
  coverage: number;
  missingDimensions: string[];
  reasons: string[];
  confidence: 'high' | 'medium' | 'low' | null;
}

export interface ScoreOptions {
  asOf?: Date;
  maxVerificationAgeMonths?: number;
}

const CONFIDENCE_RANK: Record<'low' | 'medium' | 'high', number> = {
  low: 0,
  medium: 1,
  high: 2,
};

const DEFAULT_MAX_AGE_MONTHS = 18;

export function validateScoringModel(model: ScoringModel): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();

  if (model.dimensions.length === 0) {
    issues.push('评分模型至少需要一个维度');
  }

  for (const dimension of model.dimensions) {
    if (ids.has(dimension.id)) {
      issues.push(`评分维度 ID 重复：${dimension.id}`);
    }
    ids.add(dimension.id);
    if (!(dimension.weight > 0 && dimension.weight <= 1)) {
      issues.push(`维度 ${dimension.id} 权重必须在 (0, 1] 之间`);
    }
  }

  const sum = model.dimensions.reduce((total, dimension) => total + dimension.weight, 0);
  if (Math.abs(sum - 1) > 1e-9) {
    issues.push(`评分维度权重之和必须为 1，当前为 ${sum}`);
  }

  if (!/^\d+\.\d+\.\d+$/.test(model.version)) {
    issues.push('评分模型版本必须是 semver');
  }

  if (model.eligibility.min_score_coverage < 0 || model.eligibility.min_score_coverage > 1) {
    issues.push('min_score_coverage 必须在 0–1 之间');
  }

  return issues;
}

export function assertScoringModel(model: ScoringModel): void {
  const issues = validateScoringModel(model);
  if (issues.length > 0) {
    throw new Error(`评分模型无效（${model.id}@${model.version}）：${issues.join('；')}`);
  }
}

function monthsBetween(earlier: Date, later: Date): number {
  return (
    (later.getUTCFullYear() - earlier.getUTCFullYear()) * 12 +
    (later.getUTCMonth() - earlier.getUTCMonth()) +
    (later.getUTCDate() >= earlier.getUTCDate() ? 0 : -1)
  );
}

function ratioKnownWeight(
  scores: Record<string, { score: number }>,
  dimensions: ScoringDimension[],
): { weightedScore: number | null; coverage: number; missing: string[] } {
  let knownWeight = 0;
  let weightedSum = 0;
  const missing: string[] = [];

  for (const dimension of dimensions) {
    const dimensionScore = scores[dimension.id];
    if (!dimensionScore) {
      missing.push(dimension.id);
      continue;
    }
    knownWeight += dimension.weight;
    weightedSum += dimensionScore.score * dimension.weight;
  }

  if (knownWeight === 0) {
    return { weightedScore: null, coverage: 0, missing };
  }

  return {
    weightedScore: weightedSum / knownWeight,
    coverage: knownWeight,
    missing,
  };
}

/**
 * 纯函数评分：不读取 UI 状态，不依赖当前时间（除非显式传入 asOf）。
 * 未知维度不会被当作 0 或 100，而是从正式排名中排除。
 */
export function evaluateCompetitionScore(
  competition: Competition,
  model: ScoringModel,
  options: ScoreOptions = {},
): ScoreEvaluation {
  assertScoringModel(model);

  const reasons: string[] = [];
  const scores = competition.scores;
  const asOf = options.asOf ?? new Date();
  const maxAgeMonths = options.maxVerificationAgeMonths ?? DEFAULT_MAX_AGE_MONTHS;

  if (!model.eligibility.required_verification_status.includes(competition.verification_status)) {
    reasons.push(`数据状态为 ${competition.verification_status}，不满足正式排名准入`);
  }

  if (!competition.last_verified_at) {
    reasons.push('缺少最后核验日期');
  } else {
    const verifiedAt = new Date(`${competition.last_verified_at}T00:00:00.000Z`);
    if (verifiedAt.getTime() > asOf.getTime()) {
      reasons.push('最后核验日期晚于评估时间');
    } else if (monthsBetween(verifiedAt, asOf) > maxAgeMonths) {
      reasons.push(`最后核验时间超过 ${maxAgeMonths} 个月`);
    }
  }

  if (!scores) {
    return {
      status: 'ineligible',
      weightedScore: null,
      officialScore: null,
      coverage: 0,
      missingDimensions: model.dimensions.map((dimension) => dimension.id),
      reasons: [...reasons, '尚未提供平台评分'],
      confidence: null,
    };
  }

  if (scores.model_version !== model.version) {
    reasons.push(`评分模型版本不匹配：数据为 ${scores.model_version}，当前为 ${model.version}`);
  }

  if (
    !model.eligibility.required_review_status.includes(scores.review_status) ||
    scores.review_status !== 'approved'
  ) {
    reasons.push(`评分复核状态为 ${scores.review_status}，不满足正式排名准入`);
  }

  if (scores.confidence_level) {
    const required = CONFIDENCE_RANK[model.eligibility.min_confidence];
    if (CONFIDENCE_RANK[scores.confidence_level] < required) {
      reasons.push(`证据置信度为 ${scores.confidence_level}，低于准入要求`);
    }
  }

  const { weightedScore, coverage, missing } = ratioKnownWeight(
    scores.dimension_scores,
    model.dimensions,
  );

  const baseReasons = [...reasons];
  const statusBlocked = reasons.length > 0;

  if (coverage < model.eligibility.min_score_coverage) {
    reasons.push(`评分覆盖率 ${(coverage * 100).toFixed(0)}% 低于准入要求`);
  }

  if (model.eligibility.require_all_dimensions && missing.length > 0) {
    reasons.push(`缺少维度：${missing.join('、')}`);
  }

  const dataBlocked = reasons.length > 0;
  const status: ScoreStatus = statusBlocked
    ? 'ineligible'
    : dataBlocked
      ? 'provisional'
      : 'official';

  const officialScore = status === 'official' ? weightedScore : null;

  return {
    status,
    weightedScore,
    officialScore,
    coverage,
    missingDimensions: missing,
    reasons: status === 'official' ? [] : reasons.length > 0 ? reasons : baseReasons,
    confidence: scores.confidence_level,
  };
}
