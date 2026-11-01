import type { ZodType } from 'zod';
import { parseContentFile, slugFromFilename } from '../lib/domain/content';
import {
  competitionSchema,
  projectSchema,
  resourceSchema,
  roadmapSchema,
  scoringModelSchema,
  skillSchema,
  vocabularySchema,
} from '../lib/domain/schemas';
import type {
  Competition,
  ContentEntry,
  DataBundle,
  Project,
  ScoringModel,
  Skill,
  Vocabulary,
} from '../lib/domain/types';

class DataLoadError extends Error {
  constructor(path: string, issues: string) {
    super(`数据文件 ${path} 未通过 Schema 校验：${issues}`);
    this.name = 'DataLoadError';
  }
}

function parseRecords<T>(modules: Record<string, unknown>, schema: ZodType<T>): T[] {
  const records: T[] = [];
  for (const [path, raw] of Object.entries(modules)) {
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
        .join('；');
      throw new DataLoadError(path, issues);
    }
    records.push(parsed.data);
  }
  return records;
}

const competitionModules = import.meta.glob<unknown>('../../data/competitions/*.json', {
  eager: true,
  import: 'default',
});
const skillModules = import.meta.glob<unknown>('../../data/skills/*.json', {
  eager: true,
  import: 'default',
});
const projectModules = import.meta.glob<unknown>('../../data/projects/*.json', {
  eager: true,
  import: 'default',
});
const resourceModules = import.meta.glob<unknown>('../../data/resources/*.json', {
  eager: true,
  import: 'default',
});
const roadmapModules = import.meta.glob<unknown>('../../data/roadmaps/*.json', {
  eager: true,
  import: 'default',
});
const scoringModelModules = import.meta.glob<unknown>('../../data/scoring-models/*.json', {
  eager: true,
  import: 'default',
});
const vocabularyModules = import.meta.glob<unknown>('../../data/vocabularies/*.json', {
  eager: true,
  import: 'default',
});
const contentModules = import.meta.glob<string>('../../content/guides/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const isPublicCompetition = (competition: Competition): boolean =>
  !competition.is_example && competition.verification_status !== 'rejected';

const isPublicProject = (project: Project): boolean =>
  !project.is_example && project.verification_status !== 'rejected';

function sortByName<T extends { name?: string; title?: string; id: string }>(records: T[]): T[] {
  return [...records].sort((a, b) =>
    (a.name ?? a.title ?? a.id).localeCompare(b.name ?? b.title ?? b.id, 'zh-CN'),
  );
}

const competitions = sortByName(
  parseRecords(competitionModules, competitionSchema).filter(isPublicCompetition),
);
const skills = sortByName(
  parseRecords(skillModules, skillSchema).filter((skill) => !skill.is_example),
);
const projects = [...parseRecords(projectModules, projectSchema).filter(isPublicProject)].sort(
  (a, b) => a.title.localeCompare(b.title, 'zh-CN'),
);
const resources = [
  ...parseRecords(resourceModules, resourceSchema).filter((resource) => !resource.is_example),
].sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
const roadmaps = [
  ...parseRecords(roadmapModules, roadmapSchema).filter((roadmap) => !roadmap.is_example),
].sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
const scoringModels = parseRecords(scoringModelModules, scoringModelSchema).sort((a, b) =>
  b.effective_from.localeCompare(a.effective_from),
);
const vocabularies = parseRecords(vocabularyModules, vocabularySchema).sort((a, b) =>
  a.id.localeCompare(b.id),
);

const contents: ContentEntry[] = Object.entries(contentModules)
  .map(([path, raw]) => parseContentFile(raw, slugFromFilename(path)))
  .filter((entry) => !entry.frontmatter.draft)
  .sort((a, b) => b.frontmatter.updated_at.localeCompare(a.frontmatter.updated_at));

export const dataset: DataBundle = {
  competitions,
  skills,
  projects,
  resources,
  roadmaps,
  scoringModels,
  vocabularies,
};

export { contents };

function asMap<T extends { id: string }>(records: T[]): Map<string, T> {
  return new Map(records.map((record) => [record.id, record]));
}

export const indexes = {
  competitions: asMap(competitions),
  skills: asMap(skills),
  projects: asMap(projects),
  resources: asMap(resources),
  roadmaps: asMap(roadmaps),
  vocabularies: asMap(vocabularies),
  contents: new Map(contents.map((entry) => [entry.slug, entry])),
};

export function getVocabulary(id: string): Vocabulary | undefined {
  return indexes.vocabularies.get(id);
}

export function getVocabularyTerms(id: string): Vocabulary['terms'] {
  return getVocabulary(id)?.terms ?? [];
}

export function getTermLabel(vocabularyId: string, termId: string): string {
  return getVocabularyTerms(vocabularyId).find((term) => term.id === termId)?.label ?? termId;
}

export function getDomainLabelMap(): Map<string, string> {
  return new Map(getVocabularyTerms('domains').map((term) => [term.id, term.label]));
}

export function getActiveScoringModel(): ScoringModel {
  const model = scoringModels.find((item) => item.id === 'competition-value');
  if (!model) {
    throw new Error('缺少 competition-value 评分模型数据');
  }
  return model;
}

export function getAllScoringModels(): ScoringModel[] {
  return scoringModels;
}

export type { Skill };
