import type { ContentEntry } from '../lib/domain/types';
import { contents, indexes } from './dataSource';

export function listGuides(): ContentEntry[] {
  return contents;
}

export function getGuideBySlug(slug: string): ContentEntry | undefined {
  return indexes.contents.get(slug);
}

export function getGuidesByCategory(
  category: ContentEntry['frontmatter']['category'],
): ContentEntry[] {
  return contents.filter((entry) => entry.frontmatter.category === category);
}

export function countGuides(): number {
  return contents.length;
}
