import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import {
  communityReviewSchema,
  companySchema,
  competitionSchema,
  contentFrontmatterSchema,
  projectSchema,
  resourceSchema,
  roadmapSchema,
  scoringModelSchema,
  skillSchema,
  vocabularySchema,
} from '../src/lib/domain/schemas';

const OUTPUT_DIR = path.join(process.cwd(), 'data', 'schemas');

const SCHEMAS = [
  ['competition', competitionSchema],
  ['company', companySchema],
  ['community-review', communityReviewSchema],
  ['skill', skillSchema],
  ['project', projectSchema],
  ['resource', resourceSchema],
  ['roadmap', roadmapSchema],
  ['scoring-model', scoringModelSchema],
  ['vocabulary', vocabularySchema],
  ['content-frontmatter', contentFrontmatterSchema],
] as const;

function renderSchema(name: string, schema: (typeof SCHEMAS)[number][1]): string {
  const jsonSchema = z.toJSONSchema(schema, {
    target: 'draft-2020-12',
    io: 'input',
  }) as Record<string, unknown>;

  const document = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: `TechCompetitionHub ${name}`,
    ...jsonSchema,
  };

  return `${JSON.stringify(document, null, 2)}\n`;
}

async function main(): Promise<void> {
  const check = process.argv.includes('--check');
  const generated = new Map<string, string>();

  for (const [name, schema] of SCHEMAS) {
    try {
      generated.set(`${name}.schema.json`, renderSchema(name, schema));
    } catch (error) {
      console.error(`生成 ${name} Schema 失败：`, error);
      process.exitCode = 1;
      return;
    }
  }

  if (check) {
    let failed = false;
    for (const [file, expected] of generated) {
      let actual = '';
      try {
        actual = await readFile(path.join(OUTPUT_DIR, file), 'utf8');
      } catch {
        actual = '';
      }
      if (actual !== expected) {
        console.error(`Schema 与 Schema 定义不一致：data/schemas/${file}`);
        failed = true;
      }
    }
    if (failed) {
      console.error('请运行 npm run data:schemas 并提交生成结果。');
      process.exitCode = 1;
    } else {
      console.log(`Schema 检查通过：${generated.size} 个 JSON Schema 与 Zod 定义一致。`);
    }
    return;
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  for (const [file, content] of generated) {
    await writeFile(path.join(OUTPUT_DIR, file), content, 'utf8');
  }
  console.log(`已生成 ${generated.size} 个 JSON Schema 到 data/schemas/。`);
}

main().catch((error: unknown) => {
  console.error('生成 Schema 失败：', error);
  process.exitCode = 1;
});
