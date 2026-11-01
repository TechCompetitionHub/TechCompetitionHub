import { describe, expect, it } from 'vitest';
import { loadAllData } from '../../scripts/lib/load';
import { summarizeIssues, validateDataset } from '../../src/lib/domain/validateDataset';
import { rankCompetitions } from '../../src/lib/domain/ranking';
import {
  communityReviewSchema,
  competitionSchema,
  skillSchema,
} from '../../src/lib/domain/schemas';
import type { DataBundle } from '../../src/lib/domain/types';
import exampleJson from '../../data/examples/example-competition.json';

const AS_OF = '2026-11-01';

async function load() {
  const { bundle, contents, issues } = await loadAllData();
  expect(issues).toEqual([]);
  return { bundle, contents };
}

function codes(bundle: DataBundle, contents: Parameters<typeof validateDataset>[1]) {
  return validateDataset(bundle, contents, { asOf: AS_OF }).map((issue) => issue.code);
}

describe('真实数据集', () => {
  it('通过全部结构、引用、评分与内容校验', async () => {
    const { bundle, contents } = await load();
    const issues = validateDataset(bundle, contents, { asOf: AS_OF });
    expect(issues).toEqual([]);
    expect(bundle.competitions.length).toBeGreaterThanOrEqual(10);
    expect(bundle.skills.length).toBeGreaterThanOrEqual(20);
    expect(bundle.roadmaps.length).toBeGreaterThanOrEqual(2);
    expect(contents.length).toBeGreaterThanOrEqual(4);
  });

  it('所有公开竞赛都达到 MVP 的最小字段要求', async () => {
    const { bundle } = await load();
    const verified = bundle.competitions.filter(
      (competition) => competition.verification_status === 'verified',
    );
    expect(verified.length).toBeGreaterThanOrEqual(10);
    for (const competition of verified) {
      expect(competition.id).toMatch(/^[a-z0-9-]+$/);
      expect(competition.domains.length).toBeGreaterThan(0);
      expect(competition.description.length).toBeGreaterThan(50);
      expect(competition.sources.length).toBeGreaterThan(0);
      expect(competition.last_verified_at).toBe(AS_OF);
      expect(competition.sources.some((source) => source.source_type === 'official')).toBe(true);
    }
  });

  it('评分与正式排名数量真实可复现', async () => {
    const { bundle } = await load();
    const scored = bundle.competitions.filter((competition) => competition.scores !== null);
    const model = bundle.scoringModels[0];
    const ranking = rankCompetitions(bundle.competitions, model, {
      asOf: new Date(`${AS_OF}T00:00:00.000Z`),
    });
    expect(scored.length).toBeGreaterThanOrEqual(8);
    expect(ranking.entries.length).toBe(scored.length);
    expect(ranking.excluded.length).toBe(bundle.competitions.length - scored.length);
    for (const entry of ranking.entries) {
      expect(entry.score).toBeGreaterThan(0);
      expect(entry.score).toBeLessThanOrEqual(100);
    }
  });
});

describe('校验器能拦截错误数据', () => {
  it('重复 ID', async () => {
    const { bundle, contents } = await load();
    bundle.competitions.push(structuredClone(bundle.competitions[0]));
    expect(codes(bundle, contents)).toContain('duplicate_id');
  });

  it('引用不存在的技能', async () => {
    const { bundle, contents } = await load();
    bundle.competitions[0].skills_required.push({ skill_id: 'missing-skill', target_level: 2 });
    expect(codes(bundle, contents)).toContain('missing_skill_reference');
  });

  it('技能依赖循环', async () => {
    const { bundle, contents } = await load();
    const a = skillSchema.parse(structuredClone(bundle.skills[0]));
    const b = skillSchema.parse(structuredClone(bundle.skills[1]));
    a.id = 'validation-cycle-a';
    b.id = 'validation-cycle-b';
    a.prerequisite_skill_ids = ['validation-cycle-b'];
    b.prerequisite_skill_ids = ['validation-cycle-a'];
    bundle.skills = [a, b];
    expect(codes(bundle, contents)).toContain('skill_dependency_cycle');
  });

  it('评分模型权重不等于 1', async () => {
    const { bundle, contents } = await load();
    bundle.scoringModels[0].dimensions[0].weight = 0.4;
    expect(codes(bundle, contents)).toContain('invalid_scoring_model');
  });

  it('示例数据标记为 verified', async () => {
    const { bundle, contents } = await load();
    const example = competitionSchema.parse(exampleJson);
    example.verification_status = 'verified';
    example.last_verified_at = AS_OF;
    bundle.competitions.push(example);
    expect(codes(bundle, contents)).toContain('example_verified');
  });

  it('verified 条目缺少权威来源', async () => {
    const { bundle, contents } = await load();
    const verified = bundle.competitions.find(
      (competition) => competition.verification_status === 'verified',
    );
    if (!verified) throw new Error('测试数据缺少 verified 条目');
    verified.sources = [];
    expect(codes(bundle, contents)).toContain('verified_without_authority');
  });

  it('存储总分与模型计算不一致', async () => {
    const { bundle, contents } = await load();
    const scored = bundle.competitions.find((competition) => competition.scores);
    if (!scored?.scores) throw new Error('测试数据缺少评分');
    scored.scores.weighted_score = 1;
    expect(codes(bundle, contents)).toContain('weighted_score_mismatch');
  });

  it('confirmed 日程但没有任何日期', async () => {
    const { bundle, contents } = await load();
    bundle.competitions[0].schedule.status = 'confirmed';
    expect(codes(bundle, contents)).toContain('confirmed_schedule_without_dates');
  });

  it('核验日期晚于基准日', async () => {
    const { bundle, contents } = await load();
    bundle.competitions[0].last_verified_at = '2027-01-01';
    expect(codes(bundle, contents)).toContain('future_date');
  });

  it('文章引用不存在的竞赛', async () => {
    const { bundle, contents } = await load();
    contents[0].frontmatter.related_competition_ids = ['not-a-competition'];
    expect(codes(bundle, contents)).toContain('missing_competition_reference');
  });

  it('已审核社区评价缺少公开同意会被拦截', async () => {
    const { bundle, contents } = await load();
    bundle.reviews.push(
      communityReviewSchema.parse({
        schema_version: '1.0.0',
        is_example: false,
        id: 'review-no-consent',
        competition_id: bundle.competitions[0].id,
        rating: 4,
        participated: true,
        track: '本科组',
        year: 2025,
        school: null,
        role: 'participant',
        public_profile: null,
        review: '这是一条用于测试校验逻辑的社区评价，长度足够通过 Schema。',
        evidence_url: null,
        consent_public: false,
        verification_status: 'approved',
        submitted_at: AS_OF,
        reviewed_at: AS_OF,
        notes: null,
      }),
    );
    const codes = validateDataset(bundle, contents, { asOf: AS_OF }).map((issue) => issue.code);
    expect(codes).toContain('review_without_consent');
  });

  it('参加过竞赛的评价缺少赛道或年份会被拦截', async () => {
    const { bundle, contents } = await load();
    bundle.reviews.push(
      communityReviewSchema.parse({
        schema_version: '1.0.0',
        is_example: false,
        id: 'review-missing-context',
        competition_id: bundle.competitions[0].id,
        rating: 4,
        participated: true,
        track: null,
        year: null,
        school: null,
        role: 'participant',
        public_profile: null,
        review: '这是一条用于测试参赛背景校验的社区评价，长度足够通过 Schema。',
        evidence_url: null,
        consent_public: true,
        verification_status: 'approved',
        submitted_at: AS_OF,
        reviewed_at: AS_OF,
        notes: null,
      }),
    );
    const codes = validateDataset(bundle, contents, { asOf: AS_OF }).map((issue) => issue.code);
    expect(codes).toContain('review_missing_participation_context');
  });

  it('汇总错误与警告数量', async () => {
    const { bundle, contents } = await load();
    expect(summarizeIssues(validateDataset(bundle, contents, { asOf: AS_OF }))).toEqual({
      errors: 0,
      warnings: 0,
    });
  });
});
