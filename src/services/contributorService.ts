import contributorsJson from '../../data/contributors.json';

export interface Contributor {
  id: string;
  name: string;
  github: string;
  role: string;
  commits: number;
  first_contribution: string;
  last_contribution: string;
  areas: string[];
  note: string;
}

export interface ContributorSnapshot {
  updated_at: string;
  metric: string;
  note: string;
  contributors: Contributor[];
}

const snapshot = contributorsJson as ContributorSnapshot;

export function getContributorSnapshot(): ContributorSnapshot {
  return snapshot;
}

export function listContributors(): Contributor[] {
  return [...snapshot.contributors].sort((a, b) => b.commits - a.commits);
}
