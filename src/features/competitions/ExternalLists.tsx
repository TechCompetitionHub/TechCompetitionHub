import { ExternalLink } from '../../components/ExternalLink';
import { SectionHeading } from '../../components/Layout';
import { Alert } from '../../components/States';
import type { ExternalListReference } from '../../lib/domain/schemas';
import { formatDate } from '../../lib/utils/format';

export function ExternalLists({ lists }: { lists: ExternalListReference[] }) {
  if (lists.length === 0) return null;

  return (
    <section aria-labelledby="external-lists-heading">
      <SectionHeading
        id="external-lists-heading"
        eyebrow="外部目录"
        title="外部竞赛目录（不参与评分）"
        description="外部目录或榜单只作检索线索，帮助定位竞赛；它们不是平台评分，也不代表认可度、技术含量或适合度。"
      />
      <ul className="space-y-3">
        {lists.map((list) => (
          <li key={list.id} className="rounded-xl border border-line bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <ExternalLink href={list.url} className="text-sm font-semibold">
                {list.name}
              </ExternalLink>
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-ink-500">
                {list.year} · {list.category}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-ink-500">
              {list.publisher} · 访问日期 {formatDate(list.accessed_at)}
            </p>
            {list.notes ? (
              <p className="mt-2 text-xs leading-5 text-ink-500">{list.notes}</p>
            ) : null}
          </li>
        ))}
      </ul>
      <Alert tone="warning" title="目录不等于认可度或技术含量" className="mt-3">
        平台不会因为竞赛出现在某个目录、榜单或“A
        类”口径中而自动提高分数。认可度、技术深度等维度仍按公开评分方法、证据等级与核验日期独立评估；目录信息也不参与正式排名计算。
      </Alert>
    </section>
  );
}
