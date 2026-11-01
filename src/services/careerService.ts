import type { Company } from '../lib/domain/types';
import { dataset, getTermLabel, indexes } from './dataSource';

export function listCompanies(): Company[] {
  return dataset.companies;
}

export function getCompanyById(id: string): Company | undefined {
  return indexes.companies.get(id);
}

export function getJobRoleOptions(): Array<{
  id: string;
  label: string;
  description: string;
  count: number;
  companyNames: string[];
}> {
  return (
    dataset.vocabularies.find((vocabulary) => vocabulary.id === 'job-roles')?.terms ?? []
  ).map((term) => {
    const companies = dataset.companies.filter((company) => company.role_ids.includes(term.id));
    return {
      id: term.id,
      label: term.label,
      description: term.description,
      count: companies.length,
      companyNames: companies.map((company) => company.name),
    };
  });
}

export function getJobRoleLabel(roleId: string): string {
  return getTermLabel('job-roles', roleId);
}

export function getCompaniesByRole(roleId: string): Company[] {
  if (!roleId) return dataset.companies;
  return dataset.companies.filter((company) => company.role_ids.includes(roleId));
}

export function getCompetitionName(competitionId: string): string {
  return indexes.competitions.get(competitionId)?.name ?? competitionId;
}

export function getDirectChannelCompanies(): Company[] {
  return dataset.companies.filter((company) =>
    company.competition_preferences.some(
      (preference) => preference.status === 'direct_channel' || preference.status === 'priority',
    ),
  );
}
