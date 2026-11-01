import type { ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { ExternalLink } from '../components/ExternalLink';
import { Breadcrumbs, Container, PageHeader } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { NotFoundPage } from './NotFoundPage';
import { formatDate } from '../lib/utils/format';
import { getCompetitionsByIds } from '../services/competitionService';
import { getGuideBySlug } from '../services/contentService';

const CATEGORY_LABELS: Record<string, string> = {
  guide: '指南',
  retrospective: '复盘',
  announcement: '公告',
};

const components: Components = {
  a({ href, children }: { href?: string; children?: ReactNode }) {
    if (href && /^https?:\/\//i.test(href)) {
      return <ExternalLink href={href}>{children}</ExternalLink>;
    }
    return <a href={href}>{children}</a>;
  },
};

export function GuideDetailPage() {
  const { slug } = useParams();
  const guide = slug ? getGuideBySlug(slug) : undefined;

  if (!guide) {
    return <NotFoundPage />;
  }

  return (
    <>
      <GuideMeta
        title={guide.frontmatter.title}
        summary={guide.frontmatter.summary}
        updatedAt={guide.frontmatter.updated_at}
      />
      <PageHeader
        eyebrow={CATEGORY_LABELS[guide.frontmatter.category] ?? '经验'}
        title={guide.frontmatter.title}
        description={guide.frontmatter.summary}
        meta={
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
            <Badge tone="brand">{guide.frontmatter.author}</Badge>
            <span>更新 {formatDate(guide.frontmatter.updated_at)}</span>
            {guide.frontmatter.tags.map((tag) => (
              <Badge key={tag} tone="neutral">
                {tag}
              </Badge>
            ))}
          </div>
        }
      />

      <Container className="py-8">
        <Breadcrumbs
          items={[
            { label: '首页', to: '/' },
            { label: '经验指南', to: '/guides' },
            { label: guide.frontmatter.title },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="prose-content max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
              {guide.body}
            </ReactMarkdown>
          </article>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-sm font-bold text-ink-900">文章信息</h2>
              <div className="mt-3 space-y-2 text-xs text-ink-500">
                <div>
                  <p className="font-semibold text-ink-700">分类</p>
                  <p>{CATEGORY_LABELS[guide.frontmatter.category] ?? guide.frontmatter.category}</p>
                </div>
                <div>
                  <p className="font-semibold text-ink-700">作者</p>
                  <p>{guide.frontmatter.author}</p>
                </div>
                <div>
                  <p className="font-semibold text-ink-700">最后更新</p>
                  <p>{formatDate(guide.frontmatter.updated_at)}</p>
                </div>
              </div>
              <p className="mt-4 border-t border-line pt-3 text-xs leading-5 text-ink-500">
                经验文章是社区观点，不替代官方规则；引用数据时请回到来源核对。
              </p>
            </div>

            {guide.frontmatter.related_competition_ids.length > 0 ? (
              <div className="rounded-2xl border border-line bg-surface p-5">
                <h2 className="text-sm font-bold text-ink-900">相关竞赛</h2>
                <ul className="mt-2 space-y-1.5">
                  {getCompetitionsByIds(guide.frontmatter.related_competition_ids).map(
                    (competition) => (
                      <li key={competition.id}>
                        <Link
                          to={`/competitions/${competition.id}`}
                          className="link-inline text-sm"
                        >
                          {competition.name}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ) : null}

            <div className="rounded-2xl border border-line bg-brand-50 p-5">
              <h2 className="text-sm font-bold text-ink-900">纠错与讨论</h2>
              <p className="mt-1 text-xs leading-5 text-ink-700">
                文章有事实错误或需要补充？请通过 Issue 或 Discussions 提供来源与上下文。
              </p>
              <Link to="/contribute" className="link-inline mt-3 inline-block text-xs">
                贡献指南
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}

function GuideMeta({
  title,
  summary,
  updatedAt,
}: {
  title: string;
  summary: string;
  updatedAt: string;
}) {
  usePageMeta({
    title,
    description: `${summary} 最后更新 ${formatDate(updatedAt)}。`,
  });
  return null;
}
