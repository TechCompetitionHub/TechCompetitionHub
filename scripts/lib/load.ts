import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import type { ZodType } from 'zod';
import { parseContentFile, slugFromFilename } from '../../src/lib/domain/content';
import {
  competitionSchema,
  projectSchema,
  resourceSchema,
  roadmapSchema,
  scoringModelSchema,
  skillSchema,
  vocabularySchema,
} from '../../src/lib/domain/schemas';
import type {
  Competition,
  ContentEntry,
  DataBundle,
  Project,
  Resource,
  Roadmap,
  ScoringModel,
  Skill,
  Vocabulary,
} from '../../src/lib/domain/types';
import type { ValidationIssue } from '../../src/lib/domain/validateDataset';

export const ROOT = process.cwd();

export interface LoadedRecord<T> {
  file: string;
  data: T;
}

export interface LoadResult<T> {
  records: LoadedRecord<T>[];
  issues: ValidationIssue[];
}

function issue(code: string, file: string, message: string): ValidationIssue {
  return { severity: 'error', code, path: file, message };
}

async function listFiles(directory: string, extension: string): Promise<string[]> {
  try {
    const entries = await readdir(path.join(ROOT, directory), { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

export async function loadCollection<T>(
  directory: string,
  schema: ZodType<T>,
  identity: (record: T) => string,
): Promise<LoadResult<T>> {
  const issues: ValidationIssue[] = [];
  const records: LoadedRecord<T>[] = [];

  for (const file of await listFiles(directory, '.json')) {
    const relative = `${directory}/${file}`;
    let raw: unknown;
    try {
      raw = JSON.parse(await readFile(path.join(ROOT, relative), 'utf8')) as unknown;
    } catch (error) {
      issues.push(issue('invalid_json', relative, `JSON 解析失败：${(error as Error).message}`));
      continue;
    }

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      for (const schemaIssue of parsed.error.issues) {
        issues.push(
          issue(
            'schema_error',
            relative,
            `${schemaIssue.path.join('.') || '(root)'}: ${schemaIssue.message}`,
          ),
        );
      }
      continue;
    }

    const expectedId = file.replace(/\.json$/, '');
    if (identity(parsed.data) !== expectedId) {
      issues.push(
        issue(
          'filename_id_mismatch',
          relative,
          `文件名 ${expectedId} 与记录 ID ${identity(parsed.data)} 不一致`,
        ),
      );
    }

    records.push({ file: relative, data: parsed.data });
  }

  return { records, issues };
}

export async function loadContents(): Promise<{
  records: ContentEntry[];
  issues: ValidationIssue[];
}> {
  const issues: ValidationIssue[] = [];
  const records: ContentEntry[] = [];

  for (const file of await listFiles('content/guides', '.md')) {
    const relative = `content/guides/${file}`;
    const raw = await readFile(path.join(ROOT, relative), 'utf8');
    try {
      records.push(parseContentFile(raw, slugFromFilename(file)));
    } catch (error) {
      issues.push(issue('content_error', relative, (error as Error).message));
    }
  }

  return { records, issues };
}

export async function loadExamples(): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  const files = await listFiles('data/examples', '.json');

  for (const file of files) {
    const relative = `data/examples/${file}`;
    const raw = JSON.parse(await readFile(path.join(ROOT, relative), 'utf8')) as unknown;
    const object = raw as { is_example?: boolean; verification_status?: string };
    if (object.is_example !== true) {
      issues.push(issue('example_not_flagged', relative, '示例数据必须设置 is_example: true'));
    }
    if (object.verification_status === 'verified') {
      issues.push(issue('example_verified', relative, '示例数据不得标记为 verified'));
    }
  }

  return issues;
}

export interface FullData {
  bundle: DataBundle;
  contents: ContentEntry[];
  issues: ValidationIssue[];
}

export async function loadAllData(): Promise<FullData> {
  const competitionLoad = await loadCollection(
    'data/competitions',
    competitionSchema,
    (record) => record.id,
  );
  const skillLoad = await loadCollection('data/skills', skillSchema, (record) => record.id);
  const projectLoad = await loadCollection('data/projects', projectSchema, (record) => record.id);
  const resourceLoad = await loadCollection(
    'data/resources',
    resourceSchema,
    (record) => record.id,
  );
  const roadmapLoad = await loadCollection('data/roadmaps', roadmapSchema, (record) => record.id);
  const modelLoad = await loadCollection(
    'data/scoring-models',
    scoringModelSchema,
    (record) => `${record.id}-${record.version}`,
  );
  const vocabularyLoad = await loadCollection(
    'data/vocabularies',
    vocabularySchema,
    (record) => record.id,
  );
  const contentLoad = await loadContents();
  const exampleIssues = await loadExamples();

  const issues = [
    ...competitionLoad.issues,
    ...skillLoad.issues,
    ...projectLoad.issues,
    ...resourceLoad.issues,
    ...roadmapLoad.issues,
    ...modelLoad.issues,
    ...vocabularyLoad.issues,
    ...contentLoad.issues,
    ...exampleIssues,
  ];

  const officialRecords = <T extends { is_example: boolean }>(records: LoadedRecord<T>[]) =>
    records.filter((record) => !record.data.is_example);

  for (const record of competitionLoad.records) {
    if (record.data.is_example) {
      issues.push(
        issue(
          'example_in_official_dir',
          record.file,
          '示例数据必须放在 data/examples/，不能进入正式数据目录',
        ),
      );
    }
  }

  return {
    bundle: {
      competitions: officialRecords(competitionLoad.records).map((record) => record.data),
      skills: officialRecords(skillLoad.records).map((record) => record.data),
      projects: officialRecords(projectLoad.records).map((record) => record.data),
      resources: officialRecords(resourceLoad.records).map((record) => record.data),
      roadmaps: officialRecords(roadmapLoad.records).map((record) => record.data),
      scoringModels: modelLoad.records.map((record) => record.data),
      vocabularies: vocabularyLoad.records.map((record) => record.data),
    },
    contents: contentLoad.records,
    issues,
  };
}

export async function pathExists(relative: string): Promise<boolean> {
  try {
    await stat(path.join(ROOT, relative));
    return true;
  } catch {
    return false;
  }
}

export type {
  Competition,
  ContentEntry,
  DataBundle,
  Project,
  Resource,
  Roadmap,
  ScoringModel,
  Skill,
  Vocabulary,
};
