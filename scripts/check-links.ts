import { loadAllData } from './lib/load';

const ONLINE = process.argv.includes('--online');
const STRICT = process.argv.includes('--strict');

const PLACEHOLDER_PATTERN = /(example\.com|localhost|127\.0\.0\.1|TODO|PLACEHOLDER)/i;

interface LinkEntry {
  url: string;
  source: string;
}

function collectUrls(value: unknown, source: string, output: LinkEntry[]): void {
  if (typeof value === 'string') {
    if (/^https?:\/\//i.test(value)) output.push({ url: value, source });
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectUrls(item, source, output);
    return;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectUrls(item, source, output);
  }
}

async function checkOnline(links: LinkEntry[]): Promise<LinkEntry[]> {
  const unique = [...new Map(links.map((link) => [link.url, link])).values()];
  const failures: LinkEntry[] = [];
  const queue = [...unique];
  const workers = Array.from({ length: 6 }, async () => {
    while (queue.length > 0) {
      const link = queue.shift();
      if (!link) continue;
      try {
        const response = await fetch(link.url, {
          method: 'GET',
          redirect: 'follow',
          signal: AbortSignal.timeout(15_000),
          headers: { 'user-agent': 'TechCompetitionHub link checker' },
        });
        if (response.status >= 400) {
          failures.push(link);
          console.log(`FAIL ${response.status} ${link.url} (${link.source})`);
        } else {
          console.log(`OK   ${response.status} ${link.url}`);
        }
      } catch (error) {
        failures.push(link);
        console.log(`FAIL ${(error as Error).message} ${link.url} (${link.source})`);
      }
    }
  });
  await Promise.all(workers);
  return failures;
}

async function main(): Promise<void> {
  const { bundle, contents, issues } = await loadAllData();
  const links: LinkEntry[] = [];

  collectUrls(bundle, 'data', links);

  for (const content of contents) {
    const source = `content/guides/${content.slug}.md`;
    for (const match of content.body.matchAll(/\((https?:\/\/[^)\s]+)\)/g)) {
      links.push({ url: match[1], source });
    }
  }

  for (const link of links) {
    if (PLACEHOLDER_PATTERN.test(link.url)) {
      issues.push({
        severity: 'error',
        code: 'placeholder_url',
        path: link.source,
        message: `占位链接：${link.url}`,
      });
    }
  }

  const uniqueLinks = [...new Map(links.map((link) => [link.url, link])).values()];
  console.log(`发现 ${uniqueLinks.length} 个外部链接（${links.length} 处引用）。`);

  let onlineFailures: LinkEntry[] = [];
  if (ONLINE) {
    onlineFailures = await checkOnline(uniqueLinks);
    console.log(
      `在线检查失败：${onlineFailures.length} 个。外部网络波动不应阻断 PR；使用 --strict 才会返回失败。`,
    );
  }

  const structuralErrors = issues.filter((issue) => issue.severity === 'error');
  for (const issue of structuralErrors) {
    console.log(`ERROR [${issue.code}] ${issue.path}: ${issue.message}`);
  }

  if (structuralErrors.length > 0) {
    process.exitCode = 1;
    return;
  }

  if (STRICT && onlineFailures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error('链接检查失败：', error);
  process.exitCode = 1;
});
