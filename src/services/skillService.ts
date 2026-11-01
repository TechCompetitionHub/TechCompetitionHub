import { buildSkillMap } from '../lib/domain/skillGraph';
import type { Competition, Resource, Skill } from '../lib/domain/types';
import { dataset, getTermLabel, indexes } from './dataSource';

export function listSkills(): Skill[] {
  return dataset.skills;
}

export function getSkillById(id: string): Skill | undefined {
  return indexes.skills.get(id);
}

export function getSkillsByIds(ids: string[]): Skill[] {
  return ids
    .map((id) => indexes.skills.get(id))
    .filter((skill): skill is Skill => skill !== undefined);
}

export function getSkillResources(skill: Skill): Resource[] {
  return skill.resource_ids
    .map((id) => indexes.resources.get(id))
    .filter((resource): resource is Resource => resource !== undefined);
}

export function getSkillCompetitions(skill: Skill): Competition[] {
  const referenced = new Set(skill.related_competition_ids);
  return dataset.competitions
    .filter(
      (competition) =>
        referenced.has(competition.id) ||
        competition.skills_required.some((requirement) => requirement.skill_id === skill.id),
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
}

export function getPrerequisites(skill: Skill): Skill[] {
  return getSkillsByIds(skill.prerequisite_skill_ids);
}

export function getDependents(skill: Skill): Skill[] {
  return dataset.skills.filter((candidate) => candidate.prerequisite_skill_ids.includes(skill.id));
}

export function getSkillDomainLabel(domain: string): string {
  return getTermLabel('skill-domains', domain);
}

export function getSkillDomainOptions(): Array<{ id: string; label: string; count: number }> {
  const counts = new Map<string, number>();
  for (const skill of dataset.skills) {
    counts.set(skill.domain, (counts.get(skill.domain) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([id, count]) => ({ id, label: getSkillDomainLabel(id), count }))
    .sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'));
}

export function getSkillMap(): Map<string, Skill> {
  return buildSkillMap(dataset.skills);
}
