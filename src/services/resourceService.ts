import type { Resource } from '../lib/domain/types';
import { dataset, indexes } from './dataSource';

export function listResources(): Resource[] {
  return dataset.resources;
}

export function getResourceById(id: string): Resource | undefined {
  return indexes.resources.get(id);
}

export function getResourcesByIds(ids: string[]): Resource[] {
  return ids
    .map((id) => indexes.resources.get(id))
    .filter((resource): resource is Resource => resource !== undefined);
}

export function countFreeResources(): number {
  return dataset.resources.filter((resource) => resource.free_status === 'free').length;
}
