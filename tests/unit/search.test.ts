import { describe, expect, it } from 'vitest';
import {
  activeFilterCount,
  DEFAULT_FILTERS,
  filterCompetitions,
  filtersToSearchParams,
  parseCompetitionFilters,
  searchCompetitions,
} from '../../src/lib/domain/search';
import { dataset } from '../../src/services/dataSource';

describe('搜索与筛选', () => {
  it('按中文名称与别名搜索', () => {
    const byName = searchCompetitions(dataset.competitions, '数学建模');
    expect(byName.some((competition) => competition.id === 'cumcm')).toBe(true);
    const byAlias = searchCompetitions(dataset.competitions, 'RMUC');
    expect(
      byAlias.some((competition) => competition.id === 'robomaster-university-championship'),
    ).toBe(true);
  });

  it('关键词为空时返回全部', () => {
    expect(searchCompetitions(dataset.competitions, '   ')).toHaveLength(
      dataset.competitions.length,
    );
  });

  it('按领域、对象与难度组合过滤', () => {
    const result = filterCompetitions(dataset.competitions, {
      ...DEFAULT_FILTERS,
      domain: 'math_modeling',
      audience: 'undergraduate',
      difficulty: '3',
    });
    expect(result.length).toBeGreaterThan(0);
    for (const competition of result) {
      expect(competition.domains).toContain('math_modeling');
      expect(competition.audience.levels).toContain('undergraduate');
      expect(competition.difficulty.level).toBe(3);
    }
  });

  it('按团队/个人与交付形式过滤', () => {
    const team = filterCompetitions(dataset.competitions, { ...DEFAULT_FILTERS, format: 'team' });
    expect(team.every((competition) => competition.format.team_based)).toBe(true);
    const individual = filterCompetitions(dataset.competitions, {
      ...DEFAULT_FILTERS,
      format: 'individual',
    });
    expect(individual.every((competition) => !competition.format.team_based)).toBe(true);
  });

  it('按数据状态过滤', () => {
    const verified = filterCompetitions(dataset.competitions, {
      ...DEFAULT_FILTERS,
      status: 'verified',
    });
    expect(verified.length).toBeGreaterThan(0);
    expect(verified.every((competition) => competition.verification_status === 'verified')).toBe(
      true,
    );
  });

  it('按难度与名称排序', () => {
    const byDifficulty = filterCompetitions(dataset.competitions, {
      ...DEFAULT_FILTERS,
      sort: 'difficulty-asc',
    });
    for (let index = 1; index < byDifficulty.length; index += 1) {
      expect(byDifficulty[index - 1].difficulty.level).toBeLessThanOrEqual(
        byDifficulty[index].difficulty.level,
      );
    }
  });

  it('按评分排序时未评分条目排在后面', () => {
    const scores = new Map([
      ['cumcm', 84.95],
      ['robomaster-university-championship', 88.1],
    ]);
    const result = filterCompetitions(
      dataset.competitions,
      { ...DEFAULT_FILTERS, sort: 'score-desc' },
      { scoreById: scores },
    );
    expect(result[0].id).toBe('robomaster-university-championship');
    expect(result[1].id).toBe('cumcm');
  });

  it('URL 参数往返保持一致', () => {
    const filters = parseCompetitionFilters(
      new URLSearchParams('q=机器人&domain=robotics&difficulty=5&sort=name&status=verified'),
    );
    expect(filters.q).toBe('机器人');
    expect(filters.domain).toBe('robotics');
    expect(filters.difficulty).toBe('5');
    expect(filters.sort).toBe('name');
    const params = filtersToSearchParams(filters);
    expect(parseCompetitionFilters(params)).toEqual(filters);
  });

  it('忽略非法排序与难度参数', () => {
    const filters = parseCompetitionFilters(
      new URLSearchParams('sort=hack&difficulty=9&domain=ai'),
    );
    expect(filters.sort).toBe('recommended');
    expect(filters.difficulty).toBe('');
    expect(filters.domain).toBe('ai');
  });

  it('默认参数不写入 URL，筛选数量正确', () => {
    expect(filtersToSearchParams(DEFAULT_FILTERS).toString()).toBe('');
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(0);
    expect(activeFilterCount({ ...DEFAULT_FILTERS, domain: 'ai', q: 'x' })).toBe(2);
  });
});
