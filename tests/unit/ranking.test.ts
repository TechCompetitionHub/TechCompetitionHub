import { describe, expect, it } from 'vitest';
import { rankCompetitions } from '../../src/lib/domain/ranking';
import { competitionSchema, scoringModelSchema } from '../../src/lib/domain/schemas';
import modelJson from '../../data/scoring-models/competition-value-1.0.0.json';
import cumcmJson from '../../data/competitions/cumcm.json';
import type { Competition } from '../../src/lib/domain/types';

const model = scoringModelSchema.parse(modelJson);
const asOf = new Date('2026-11-01T00:00:00.000Z');
const base = competitionSchema.parse(cumcmJson);

function clone(id: string, name: string): Competition {
  const copy = structuredClone(base);
  copy.id = id;
  copy.name = name;
  return competitionSchema.parse(copy);
}

describe('排名规则', () => {
  const a = clone('test-a', '测试 A');
  const b = clone('test-b', '测试 B');
  const c = clone('test-c', '测试 C');
  if (c.scores) {
    c.scores.dimension_scores.technical_depth.score = 60;
    c.scores.weighted_score = 79.45;
  }

  it('同分并列，下一名次跳过', () => {
    const result = rankCompetitions([a, b, c], model, { asOf });
    expect(result.entries.map((entry) => entry.rank)).toEqual([1, 1, 3]);
    expect(result.entries[0].tied).toBe(true);
    expect(result.entries[1].tied).toBe(true);
    expect(result.entries[2].tied).toBe(false);
  });

  it('排序稳定且可复现', () => {
    const first = rankCompetitions([a, b, c], model, { asOf });
    const second = rankCompetitions([a, b, c], model, { asOf });
    expect(first.entries.map((entry) => entry.competition.id)).toEqual(
      second.entries.map((entry) => entry.competition.id),
    );
  });

  it('未满足准入的条目进入 excluded 而不是被悄悄丢弃', () => {
    const unscored = clone('test-unscored', '未评分测试');
    unscored.scores = null;
    const result = rankCompetitions([a, unscored], model, { asOf });
    expect(result.entries).toHaveLength(1);
    expect(result.excluded).toHaveLength(1);
    expect(result.excluded[0].reasons.length).toBeGreaterThan(0);
    expect(result.totalEvaluated).toBe(2);
  });

  it('按领域过滤后只在领域内排名', () => {
    const result = rankCompetitions([a, b, c], model, { asOf, domain: 'math_modeling' });
    expect(result.entries).toHaveLength(3);
  });

  it('领域不匹配时返回空结果', () => {
    const result = rankCompetitions([a], model, { asOf, domain: 'cybersecurity' });
    expect(result.entries).toHaveLength(0);
    expect(result.totalEvaluated).toBe(0);
  });
});
