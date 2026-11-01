import { describe, expect, it } from 'vitest';
import { validateScoringModel } from '../../src/lib/domain/scoring';
import { scoringModelSchema } from '../../src/lib/domain/schemas';
import modelJson from '../../data/scoring-models/competition-value-1.0.0.json';

describe('评分模型数据', () => {
  const model = scoringModelSchema.parse(modelJson);

  it('通过 Schema 与权重校验', () => {
    expect(validateScoringModel(model)).toEqual([]);
    const sum = model.dimensions.reduce((total, dimension) => total + dimension.weight, 0);
    expect(Math.abs(sum - 1)).toBeLessThan(1e-9);
  });
});
