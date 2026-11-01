import type { Roadmap } from '../lib/domain/types';
import type { TargetSkill } from '../lib/domain/roadmap';
import { dataset, indexes } from './dataSource';

export function listRoadmaps(): Roadmap[] {
  return dataset.roadmaps;
}

export function getRoadmapById(id: string): Roadmap | undefined {
  return indexes.roadmaps.get(id);
}

export interface PlannerTarget {
  type: 'competition' | 'roadmap';
  id: string;
  name: string;
  description: string;
  href: string;
  targetSkills: TargetSkill[];
}

export function getPlannerTargets(): PlannerTarget[] {
  const competitions: PlannerTarget[] = dataset.competitions
    .filter((competition) => competition.skills_required.length > 0)
    .map((competition) => ({
      type: 'competition',
      id: competition.id,
      name: competition.name,
      description: competition.summary,
      href: `/competitions/${competition.id}`,
      targetSkills: competition.skills_required.map((requirement) => ({
        skillId: requirement.skill_id,
        targetLevel: requirement.target_level,
      })),
    }));

  const roadmaps: PlannerTarget[] = dataset.roadmaps.map((roadmap) => ({
    type: 'roadmap',
    id: roadmap.id,
    name: roadmap.title,
    description: roadmap.summary,
    href: `/guides`,
    targetSkills: roadmap.target_skill_levels.map((item) => ({
      skillId: item.skill_id,
      targetLevel: item.target_level,
    })),
  }));

  return [...competitions, ...roadmaps].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
}

export function getPlannerTarget(type: string, id: string): PlannerTarget | undefined {
  return getPlannerTargets().find((target) => target.type === type && target.id === id);
}
