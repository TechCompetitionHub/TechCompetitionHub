import type { Source } from '../lib/domain/types';
import { formatDate } from '../lib/utils/format';
import { ExternalLink } from './ExternalLink';

const SOURCE_TYPE_LABELS: Record<string, string> = {
  official: '官方竞赛网站',
  organizer: '主办/承办单位',
  institutional: '高校/机构',
  news: '可信媒体',
  community: '社区经验',
  research: '研究资料',
};

export function SourceList({ sources }: { sources: Source[] }) {
  return (
    <ul className="space-y-4">
      {sources.map((source) => (
        <li key={source.id} className="rounded-xl border border-line bg-surface p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <ExternalLink href={source.url} className="text-sm font-semibold">
              {source.title}
            </ExternalLink>
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-ink-500">
              {SOURCE_TYPE_LABELS[source.source_type] ?? source.source_type}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-ink-500">
            {source.publisher} · 访问日期 {formatDate(source.accessed_at)}
            {source.published_at ? ` · 发布 ${formatDate(source.published_at)}` : ''}
          </p>
          <p className="mt-2 text-xs leading-5 text-ink-500">
            支持字段：{source.supports.join('、')}
          </p>
          {source.notes ? (
            <p className="mt-1 text-xs leading-5 text-ink-500">{source.notes}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
