import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Container, PageHeader } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { EmptyState } from '../components/States';
import { formatDate } from '../lib/utils/format';
import { getGuidesByCategory, listGuides } from '../services/contentService';

const CATEGORY_LABELS: Record<string, string> = {
  guide: '指南',
  retrospective: '复盘',
  announcement: '公告',
};

export function GuidesPage() {
  usePageMeta({
    title: '经验指南',
    description:
      '选赛、备赛、复盘、项目可复现性与数据贡献的原创指南。经验内容是社区观点，不替代官方规则。',
  });

  const guides = listGuides();
  const categories = ['guide', 'retrospective', 'announcement'] as const;

  return (
    <>
      <PageHeader
        eyebrow="经验社区"
        title="经验指南"
        description="这里放方法论、模板与复盘，不放未经授权的课程材料或他人作品。竞赛规则仍以官方来源为准。"
        meta={<p className="text-sm text-ink-500">共 {guides.length} 篇文章。</p>}
      />

      <Container className="py-8">
        <h2 className="sr-only">指南列表</h2>
        {guides.length > 0 ? (
          <div className="space-y-10">
            {categories.map((category) => {
              const items = getGuidesByCategory(category);
              if (items.length === 0) return null;
              return (
                <section key={category} aria-labelledby={`category-${category}`}>
                  <h2 id={`category-${category}`} className="text-xl font-bold text-ink-900">
                    {CATEGORY_LABELS[category]}
                  </h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((guide) => (
                      <article
                        key={guide.slug}
                        className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-card"
                      >
                        <div className="flex flex-wrap gap-2">
                          <Badge tone="brand">{CATEGORY_LABELS[guide.frontmatter.category]}</Badge>
                          {guide.frontmatter.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} tone="neutral">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="mt-3 text-lg font-bold text-ink-900">
                          <Link to={`/guides/${guide.slug}`} className="hover:text-brand-700">
                            {guide.frontmatter.title}
                          </Link>
                        </h3>
                        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-ink-500">
                          {guide.frontmatter.summary}
                        </p>
                        <p className="mt-4 border-t border-line pt-3 text-xs text-ink-500">
                          {guide.frontmatter.author} · 更新{' '}
                          {formatDate(guide.frontmatter.updated_at)}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="暂无指南"
            description="仓库里还没有通过 frontmatter 校验的公开指南。平台不会用批量生成的占位文章填充。"
          />
        )}

        <div className="mt-10 rounded-2xl border border-line bg-brand-50 p-6">
          <h2 className="text-lg font-bold text-ink-900">想投稿？</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-700">
            经验文章应包含可复现的上下文、证据与限制，不包含未授权材料、个人敏感信息或代做内容。投稿前请阅读贡献指南与行为准则。
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/contribute" className="link-inline text-sm">
              阅读贡献指南
            </Link>
            <Link to="/community" className="link-inline text-sm">
              前往社区入口
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
