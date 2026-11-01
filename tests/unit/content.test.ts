import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseContentFile, slugFromFilename } from '../../src/lib/domain/content';
import { contentFrontmatterSchema } from '../../src/lib/domain/schemas';

describe('Markdown 内容解析', () => {
  it('从文件名生成 slug', () => {
    expect(slugFromFilename('content/guides/01-choose.md')).toBe('choose');
    expect(slugFromFilename('C:\\x\\preparation.md')).toBe('preparation');
  });

  it('解析 frontmatter 与正文', () => {
    const raw = [
      '---',
      'title: 测试文章',
      'summary: 这是一个用于测试的内容摘要，长度足够通过校验。',
      'category: guide',
      'tags:',
      '  - 测试',
      'author: 测试作者',
      'updated_at: "2026-11-01"',
      'draft: false',
      'related_competition_ids: []',
      'related_skill_ids: []',
      '---',
      '',
      '# 正文',
      '内容',
    ].join('\n');
    const entry = parseContentFile(raw, 'test');
    expect(entry.frontmatter.title).toBe('测试文章');
    expect(entry.body).toContain('# 正文');
    expect(contentFrontmatterSchema.safeParse(entry.frontmatter).success).toBe(true);
  });

  it('缺少 frontmatter 时抛出可读错误', () => {
    expect(() => parseContentFile('# 没有 frontmatter', 'bad')).toThrow(/frontmatter/);
  });

  it('非法字段被 Schema 拦截', () => {
    const raw = ['---', 'title: 短', '---', '正文'].join('\n');
    expect(() => parseContentFile(raw, 'bad')).toThrow(/frontmatter 不合法/);
  });

  it('真实指南都能解析且 slug 唯一', async () => {
    const dir = path.join(process.cwd(), 'content', 'guides');
    const { readdir } = await import('node:fs/promises');
    const files = (await readdir(dir)).filter((file) => file.endsWith('.md'));
    expect(files.length).toBeGreaterThanOrEqual(4);
    const slugs = new Set<string>();
    for (const file of files) {
      const raw = await readFile(path.join(dir, file), 'utf8');
      const entry = parseContentFile(raw, slugFromFilename(file));
      expect(entry.frontmatter.draft).toBe(false);
      expect(slugs.has(entry.slug)).toBe(false);
      slugs.add(entry.slug);
    }
  });
});
