import type { Competition } from '../lib/domain/types';
import { dataset, indexes } from './dataSource';
import { getCompetitionsByIds } from './competitionService';

export function listProjects() {
  return dataset.projects;
}

export function getProjectById(id: string) {
  return indexes.projects.get(id);
}

export function getProjectCompetitions(projectId: string): Competition[] {
  const project = indexes.projects.get(projectId);
  if (!project) return [];
  return getCompetitionsByIds(project.competition_ids);
}

export function hasVerifiedProjects(): boolean {
  return dataset.projects.some((project) => project.verification_status === 'verified');
}
