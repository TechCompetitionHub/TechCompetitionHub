import { EQUIPMENT_OPTIONS } from '../lib/domain/equipment';
import { rankCompetitions, type RankingResult } from '../lib/domain/ranking';
import { evaluateCompetitionScore } from '../lib/domain/scoring';
import type { Competition, Skill } from '../lib/domain/types';
import {
  dataset,
  getActiveScoringModel,
  getDomainLabelMap,
  getTermLabel,
  getVocabularyTerms,
  indexes,
} from './dataSource';

export function listCompetitions(): Competition[] {
  return dataset.competitions;
}

export function getCompetitionById(id: string): Competition | undefined {
  return indexes.competitions.get(id);
}

export function getCompetitionsByIds(ids: string[]): Competition[] {
  return ids
    .map((id) => indexes.competitions.get(id))
    .filter((competition): competition is Competition => competition !== undefined);
}

export function getCompetitionSkills(competition: Competition): Skill[] {
  return competition.skills_required
    .map((requirement) => indexes.skills.get(requirement.skill_id))
    .filter((skill): skill is Skill => skill !== undefined);
}

export function getRelatedProjects(competitionId: string) {
  return dataset.projects.filter((project) => project.competition_ids.includes(competitionId));
}

export function getDomainLabel(domainId: string): string {
  return getDomainLabelMap().get(domainId) ?? domainId;
}

export function getAudienceLabel(audienceId: string): string {
  return getTermLabel('audience-levels', audienceId);
}

export function getDomainOptions(): Array<{
  id: string;
  label: string;
  description: string;
  count: number;
}> {
  return getVocabularyTerms('domains').map((term) => ({
    id: term.id,
    label: term.label,
    description: term.description,
    count: dataset.competitions.filter((competition) => competition.domains.includes(term.id))
      .length,
  }));
}

export function getAudienceOptions(): Array<{ id: string; label: string; count: number }> {
  return getVocabularyTerms('audience-levels').map((term) => ({
    id: term.id,
    label: term.label,
    count: dataset.competitions.filter((competition) =>
      competition.audience.levels.includes(term.id),
    ).length,
  }));
}

export function getDifficultyOptions(): Array<{ value: string; label: string }> {
  return getVocabularyTerms('difficulty-levels').map((term) => ({
    value: term.id,
    label: term.label,
  }));
}

export function getFormatOptions(): Array<{ value: string; label: string }> {
  return [
    { value: 'team', label: '团队赛' },
    { value: 'individual', label: '个人赛' },
    { value: 'offline', label: '线下' },
    { value: 'online', label: '线上' },
    { value: 'hybrid', label: '线上线下混合' },
  ];
}

export function getCostOptions(): Array<{ value: string; label: string }> {
  return getVocabularyTerms('cost-statuses').map((term) => ({
    value: term.id,
    label: term.label,
  }));
}

export function getStatusOptions(): Array<{ value: string; label: string }> {
  return getVocabularyTerms('verification-statuses').map((term) => ({
    value: term.id,
    label: term.label,
  }));
}

export function getEquipmentOptions(): Array<{
  value: string;
  label: string;
  description: string;
  count: number;
}> {
  return EQUIPMENT_OPTIONS.map((option) => ({
    ...option,
    count: dataset.competitions.filter((competition) => competition.equipment.type === option.value)
      .length,
  }));
}

export function getScoreMap(asOf?: Date): Map<string, number> {
  const model = getActiveScoringModel();
  const map = new Map<string, number>();
  for (const competition of dataset.competitions) {
    const evaluation = evaluateCompetitionScore(competition, model, { asOf });
    if (evaluation.status === 'official' && evaluation.officialScore !== null) {
      map.set(competition.id, evaluation.officialScore);
    }
  }
  return map;
}

export function getValueRanking(domain?: string | null): RankingResult {
  return rankCompetitions(dataset.competitions, getActiveScoringModel(), {
    domain: domain || null,
  });
}

export function getCompetitionScoreEvaluation(competition: Competition) {
  return evaluateCompetitionScore(competition, getActiveScoringModel());
}

export function countVerifiedCompetitions(): number {
  return dataset.competitions.filter(
    (competition) => competition.verification_status === 'verified',
  ).length;
}

export function countScoredCompetitions(): number {
  return dataset.competitions.filter((competition) => competition.scores !== null).length;
}

export function countOfficialRankedCompetitions(): number {
  return getValueRanking().entries.length;
}
