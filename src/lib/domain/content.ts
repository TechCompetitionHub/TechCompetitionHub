import { parse as parseYaml } from 'yaml';
import { contentFrontmatterSchema } from './schemas';
import type { ContentEntry } from './types';

export function slugFromFilename(filename: string): string {
  return (
    filename
      .replace(/\\/g, '/')
      .split('/')
      .pop()
      ?.replace(/\.md$/i, '')
      .replace(/^\d+[-_]/, '') ?? ''
  );
}

export function parseContentFile(raw: string, slug: string): ContentEntry {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) {
    throw new Error(`内容文件 ${slug}.md 缺少 YAML frontmatter`);
  }

  const frontmatterRaw = parseYaml(match[1]) as unknown;
  const parsed = contentFrontmatterSchema.safeParse(frontmatterRaw);
  if (!parsed.success) {
    throw new Error(
      `内容文件 ${slug}.md 的 frontmatter 不合法：${parsed.error.issues
        .map((issue) => `${issue.path.join('.')} ${issue.message}`)
        .join('；')}`,
    );
  }

  return {
    slug,
    frontmatter: parsed.data,
    body: match[2].trim(),
  };
}
