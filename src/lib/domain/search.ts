import type { Competition } from './types';

export type CompetitionSort =
  'recommended' | 'name' | 'difficulty-asc' | 'difficulty-desc' | 'verified-desc' | 'score-desc';

export interface CompetitionFilters {
  q: string;
  domain: string;
  audience: string;
  difficulty: string;
  format: string;
  status: string;
  cost: string;
  sort: CompetitionSort;
}

export const DEFAULT_FILTERS: CompetitionFilters = {
  q: '',
  domain: '',
  audience: '',
  difficulty: '',
  format: '',
  status: '',
  cost: '',
  sort: 'recommended',
};

const SORT_VALUES: CompetitionSort[] = [
  'recommended',
  'name',
  'difficulty-asc',
  'difficulty-desc',
  'verified-desc',
  'score-desc',
];

const FILTER_KEYS: Array<keyof CompetitionFilters> = [
  'q',
  'domain',
  'audience',
  'difficulty',
  'format',
  'status',
  'cost',
  'sort',
];

export function parseCompetitionFilters(params: URLSearchParams): CompetitionFilters {
  const filters: CompetitionFilters = { ...DEFAULT_FILTERS };

  for (const key of FILTER_KEYS) {
    const value = params.get(key);
    if (!value) continue;
    if (key === 'sort') {
      if ((SORT_VALUES as string[]).includes(value)) {
        filters.sort = value as CompetitionSort;
      }
      continue;
    }
    if (key === 'difficulty') {
      const level = Number(value);
      if (Number.isInteger(level) && level >= 1 && level <= 5) {
        filters.difficulty = String(level);
      }
      continue;
    }
    filters[key] = value.trim().slice(0, 120);
  }

  return filters;
}

export function filtersToSearchParams(filters: CompetitionFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = filters[key];
    if (!value || value === DEFAULT_FILTERS[key]) continue;
    params.set(key, value);
  }
  return params;
}

export function activeFilterCount(filters: CompetitionFilters): number {
  return FILTER_KEYS.filter((key) => key !== 'sort' && filters[key] !== DEFAULT_FILTERS[key])
    .length;
}

function normalize(value: string): string {
  return value.toLocaleLowerCase('zh-CN').replace(/\s+/g, ' ').trim();
}

function haystack(competition: Competition): string {
  return normalize(
    [
      competition.name,
      ...competition.aliases,
      competition.summary,
      competition.description,
      ...competition.domains,
      ...competition.organizers.map((organizer) => organizer.name),
    ].join(' '),
  );
}

function matchesQuery(competition: Competition, query: string): boolean {
  const tokens = normalize(query).split(' ').filter(Boolean);
  if (tokens.length === 0) return true;
  const target = haystack(competition);
  return tokens.every((token) => target.includes(token));
}

function matchesAudience(competition: Competition, audience: string): boolean {
  return competition.audience.levels.includes(audience);
}

function matchesFormat(competition: Competition, format: string): boolean {
  if (!format) return true;
  if (format === 'team') return competition.format.team_based;
  if (format === 'individual') return !competition.format.team_based;
  return competition.format.delivery_modes.includes(format as 'online' | 'offline' | 'hybrid');
}

function matchesCost(competition: Competition, cost: string): boolean {
  if (!cost) return true;
  return competition.estimated_cost.status === cost;
}

function relevanceScore(competition: Competition, query: string): number {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 0;
  const name = normalize(competition.name);
  const aliases = competition.aliases.map(normalize);
  if (name === normalizedQuery) return 100;
  if (name.startsWith(normalizedQuery)) return 80;
  if (name.includes(normalizedQuery)) return 60;
  if (aliases.some((alias) => alias.includes(normalizedQuery))) return 40;
  if (normalize(competition.summary).includes(normalizedQuery)) return 20;
  return 10;
}

export interface FilterOptions {
  scoreById?: ReadonlyMap<string, number>;
}

export function filterCompetitions(
  competitions: Competition[],
  filters: CompetitionFilters,
  options: FilterOptions = {},
): Competition[] {
  const filtered = competitions.filter((competition) => {
    if (!matchesQuery(competition, filters.q)) return false;
    if (filters.domain && !competition.domains.includes(filters.domain)) return false;
    if (filters.audience && !matchesAudience(competition, filters.audience)) return false;
    if (filters.difficulty && competition.difficulty.level !== Number(filters.difficulty))
      return false;
    if (!matchesFormat(competition, filters.format)) return false;
    if (!matchesCost(competition, filters.cost)) return false;
    if (filters.status && competition.verification_status !== filters.status) return false;
    return true;
  });

  const scoreOf = (competition: Competition): number =>
    options.scoreById?.get(competition.id) ?? -1;

  return filtered.sort((a, b) => {
    switch (filters.sort) {
      case 'name':
        return a.name.localeCompare(b.name, 'zh-CN');
      case 'difficulty-asc':
        return a.difficulty.level - b.difficulty.level || a.name.localeCompare(b.name, 'zh-CN');
      case 'difficulty-desc':
        return b.difficulty.level - a.difficulty.level || a.name.localeCompare(b.name, 'zh-CN');
      case 'verified-desc':
        return (
          (b.last_verified_at ?? '').localeCompare(a.last_verified_at ?? '') ||
          a.name.localeCompare(b.name, 'zh-CN')
        );
      case 'score-desc':
        return scoreOf(b) - scoreOf(a) || a.name.localeCompare(b.name, 'zh-CN');
      case 'recommended':
      default: {
        if (filters.q) {
          const relevance = relevanceScore(b, filters.q) - relevanceScore(a, filters.q);
          if (relevance !== 0) return relevance;
        }
        const verified =
          Number(b.verification_status === 'verified') -
          Number(a.verification_status === 'verified');
        if (verified !== 0) return verified;
        const score = scoreOf(b) - scoreOf(a);
        if (score !== 0) return score;
        return a.name.localeCompare(b.name, 'zh-CN');
      }
    }
  });
}

export function searchCompetitions(competitions: Competition[], query: string): Competition[] {
  return filterCompetitions(competitions, { ...DEFAULT_FILTERS, q: query });
}
