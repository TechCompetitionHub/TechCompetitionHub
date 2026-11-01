import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const BASE = process.env.VITE_BASE_PATH ?? '/';
const BASE_NO_SLASH = BASE.replace(/\/$/, '');
const ASSET_BASE = BASE === '/' ? '/assets/' : `${BASE}assets/`;
const SITE_URL = (process.env.SITE_URL ?? 'https://techcompetitionhub.github.io').replace(
  /\/$/,
  '',
);

async function listSlugs(directory: string, extension: '.json' | '.md'): Promise<string[]> {
  const { readdir } = await import('node:fs/promises');
  try {
    const entries = await readdir(path.join(ROOT, directory), { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
      .map((entry) => entry.name.replace(extension, ''))
      .sort();
  } catch {
    return [];
  }
}

async function main(): Promise<void> {
  const index = await readFile(path.join(DIST, 'index.html'), 'utf8');

  if (!index.includes(ASSET_BASE) && !index.includes(`"${BASE}"`)) {
    throw new Error(`构建产物的资源路径不包含预期 base：${BASE}`);
  }

  await writeFile(path.join(DIST, '404.html'), index, 'utf8');
  await writeFile(path.join(DIST, '.nojekyll'), '', 'utf8');

  const competitionIds = await listSlugs('data/competitions', '.json');
  const skillIds = await listSlugs('data/skills', '.json');
  const guideSlugs = await listSlugs('content/guides', '.md');
  const domainVocabulary = JSON.parse(
    await readFile(path.join(ROOT, 'data', 'vocabularies', 'domains.json'), 'utf8'),
  ) as { terms?: Array<{ id: string }> };
  const domainIds = (domainVocabulary.terms ?? []).map((term) => term.id).sort();

  const staticRoutes = [
    '',
    'competitions',
    'categories',
    'rankings',
    'projects',
    'skills',
    'planner',
    'guides',
    'community',
    'submit-competition',
    'submit-review',
    'about',
    'contribute',
    'data-policy',
    'scoring-method',
    'privacy',
  ];

  const urls = [
    ...staticRoutes.map((route) => `${SITE_URL}/${route}`.replace(/\/$/, '/')),
    ...competitionIds.map((id) => `${SITE_URL}/competitions/${id}`),
    ...domainIds.map((id) => `${SITE_URL}/categories/${id}`),
    ...skillIds.map((id) => `${SITE_URL}/skills/${id}`),
    ...guideSlugs.map((slug) => `${SITE_URL}/guides/${slug}`),
  ];

  const today = new Date().toISOString().slice(0, 10);
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (url) => `  <url><loc>${url.replace(/&/g, '&amp;')}</loc><lastmod>${today}</lastmod></url>`,
    ),
    '</urlset>',
    '',
  ].join('\n');

  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap, 'utf8');
  const robots = ['User-agent: *', 'Allow: /', `Sitemap: ${SITE_URL}/sitemap.xml`, ''].join('\n');
  await writeFile(path.join(DIST, 'robots.txt'), robots, 'utf8');

  const fallback = await readFile(path.join(DIST, '404.html'), 'utf8');
  if (fallback !== index) {
    throw new Error('404.html 与 index.html 不一致，GitHub Pages 深层链接回退会失效');
  }
  if (BASE !== '/' && /(?:src|href)="\/assets\//.test(index)) {
    throw new Error('构建产物包含未加 base 的根路径资源引用');
  }
  if (!sitemap.includes(`${SITE_URL}/competitions/${competitionIds[0]}`)) {
    throw new Error('sitemap 缺少竞赛详情 URL');
  }
  if (domainIds.length === 0 || !sitemap.includes(`${SITE_URL}/categories/${domainIds[0]}`)) {
    throw new Error('sitemap 缺少竞赛类别 URL');
  }
  if (!robots.includes(`${SITE_URL}/sitemap.xml`)) {
    throw new Error('robots.txt 未指向 sitemap');
  }
  if (competitionIds.length < 1 || skillIds.length < 1 || guideSlugs.length < 1) {
    throw new Error('sitemap 数据为空：请确认 data/ 与 content/ 已生成');
  }

  console.log(
    `postbuild：404.html、.nojekyll、sitemap.xml（${urls.length} 个 URL）、robots.txt 已生成并校验；base=${BASE_NO_SLASH}/`,
  );
}

main().catch((error: unknown) => {
  console.error('postbuild 失败：', error);
  process.exitCode = 1;
});
