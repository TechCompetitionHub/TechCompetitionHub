import { describe, expect, it } from 'vitest';
import { evaluateCompetitionScore, validateScoringModel } from '../../src/lib/domain/scoring';
import {
  competitionSchema,
  scoringModelSchema,
  type Competition,
  type ScoringModel,
} from '../../src/lib/domain/schemas';
import modelJson from '../../data/scoring-models/competition-value-1.0.0.json';
import cumcmJson from '../../data/competitions/cumcm.json';
import robomasterJson from '../../data/competitions/robomaster-university-championship.json';

const model: ScoringModel = scoringModelSchema.parse(modelJson);
const base: Competition = competitionSchema.parse(cumcmJson);
const asOf = new Date('2026-11-01T00:00:00.000Z');

function fixture(mutate: (competition: Competition) => void): Competition {
  const copy = structuredClone(base);
  mutate(copy);
  return competitionSchema.parse(copy);
}

describe('评分模型', () => {
  it('权重之和为 1 且维度合法', () => {
    expect(validateScoringModel(model)).toEqual([]);
    const sum = model.dimensions.reduce((total, dimension) => total + dimension.weight, 0);
    expect(Math.abs(sum - 1)).toBeLessThan(1e-9);
  });

  it('权重不足 1 时报告错误', () => {
    const broken = structuredClone(model);
    broken.dimensions[0].weight = 0.1;
    expect(validateScoringModel(broken).some((message) => message.includes('权重之和'))).toBe(true);
  });

  it('重复维度 ID 会报告错误', () => {
    const broken = structuredClone(model);
    broken.dimensions[1].id = broken.dimensions[0].id;
    expect(validateScoringModel(broken).some((message) => message.includes('重复'))).toBe(true);
  });
});

describe('竞赛评分计算', () => {
  it('对完整且已核验的数据计算正式分', () => {
    const evaluation = evaluateCompetitionScore(base, model, { asOf });
    expect(evaluation.status).toBe('official');
    expect(evaluation.officialScore).toBeCloseTo(84.95, 2);
    expect(evaluation.coverage).toBe(1);
    expect(evaluation.missingDimensions).toEqual([]);
  });

  it('缺少维度时只给暂定分，不进入正式排名', () => {
    const competition = fixture((item) => {
      delete item.scores?.dimension_scores.cost_accessibility;
    });
    const evaluation = evaluateCompetitionScore(competition, model, { asOf });
    expect(evaluation.status).toBe('provisional');
    expect(evaluation.officialScore).toBeNull();
    expect(evaluation.weightedScore).not.toBeNull();
    expect(evaluation.coverage).toBeCloseTo(0.95, 5);
    expect(evaluation.missingDimensions).toEqual(['cost_accessibility']);
    expect(evaluation.reasons.join(' ')).toContain('缺少维度');
  });

  it('未知维度不会被当作 0 或 100', () => {
    const competition = fixture((item) => {
      delete item.scores?.dimension_scores.cost_accessibility;
    });
    const evaluation = evaluateCompetitionScore(competition, model, { asOf });
    const expected = (82 * 0.25 + 90 * 0.2 + 85 * 0.2 + 88 * 0.15 + 90 * 0.15) / 0.95;
    expect(evaluation.weightedScore).toBeCloseTo(expected, 5);
  });

  it('未核验数据不能获得正式分', () => {
    const competition = fixture((item) => {
      item.verification_status = 'needs_review';
    });
    const evaluation = evaluateCompetitionScore(competition, model, { asOf });
    expect(evaluation.status).toBe('ineligible');
    expect(evaluation.reasons.join(' ')).toContain('不满足正式排名准入');
  });

  it('评分未审核不能进入正式排名', () => {
    const competition = fixture((item) => {
      if (item.scores) item.scores.review_status = 'draft';
    });
    const evaluation = evaluateCompetitionScore(competition, model, { asOf });
    expect(evaluation.status).toBe('ineligible');
    expect(evaluation.reasons.join(' ')).toContain('复核状态');
  });

  it('评分模型版本不一致会被拒绝', () => {
    const competition = fixture((item) => {
      if (item.scores) item.scores.model_version = '0.9.0';
    });
    const evaluation = evaluateCompetitionScore(competition, model, { asOf });
    expect(evaluation.status).toBe('ineligible');
    expect(evaluation.reasons.join(' ')).toContain('版本不匹配');
  });

  it('超过 18 个月未核验会被拒绝', () => {
    const competition = fixture((item) => {
      item.last_verified_at = '2024-01-01';
    });
    const evaluation = evaluateCompetitionScore(competition, model, {
      asOf: new Date('2026-11-01T00:00:00.000Z'),
    });
    expect(evaluation.status).toBe('ineligible');
    expect(evaluation.reasons.join(' ')).toContain('18 个月');
  });

  it('证据置信度不足会被拒绝', () => {
    const competition = fixture((item) => {
      if (item.scores) item.scores.confidence_level = 'low';
    });
    const evaluation = evaluateCompetitionScore(competition, model, { asOf });
    expect(evaluation.status).toBe('ineligible');
    expect(evaluation.reasons.join(' ')).toContain('置信度');
  });

  it('缺少评分时返回资料不足而不是 0 分', () => {
    const competition = fixture((item) => {
      item.scores = null;
    });
    const evaluation = evaluateCompetitionScore(competition, model, { asOf });
    expect(evaluation.status).toBe('ineligible');
    expect(evaluation.weightedScore).toBeNull();
    expect(evaluation.officialScore).toBeNull();
  });

  it('真实数据中的 RoboMaster 也可复现计算', () => {
    const competition = competitionSchema.parse(robomasterJson);
    const evaluation = evaluateCompetitionScore(competition, model, { asOf });
    expect(evaluation.status).toBe('official');
    expect(evaluation.officialScore).toBeCloseTo(88.1, 2);
  });
});
