import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Button, ExternalButton } from '../components/Button';
import { Container, PageHeader, SectionHeading } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { Alert } from '../components/States';
import { getForumCategoryDetail } from '../features/forum/forumCategoryDetails';
import {
  COMMUNITY_CATEGORY_BY_SLUG,
  discussionCategoryUrl,
  forumPath,
  SITE,
} from '../services/site';

export function ForumCategoryPage() {
  const { slug = '' } = useParams();
  const category = COMMUNITY_CATEGORY_BY_SLUG.get(slug);
  const detail = getForumCategoryDetail(slug);
  const [copiedId, setCopiedId] = useState('');

  usePageMeta({
    title: category ? `${category.name} 论坛分类` : '论坛分类不存在',
    description:
      category && detail
        ? `${category.name}：${detail.summary} 包含适用内容、发帖模板与相关站内入口。`
        : '这个论坛分类不存在。',
  });

  if (!category || !detail) {
    return (
      <Container className="py-16">
        <p className="text-sm font-semibold text-brand-700">404</p>
        <h1 className="mt-2 text-3xl font-bold text-ink-900">这个论坛分类不存在</h1>
        <p className="mt-3 text-sm leading-6 text-ink-500">
          论坛分类来自当前 GitHub Discussions 的实际分类；请返回论坛首页选择。
        </p>
        <Button className="mt-6" onClick={() => window.history.back()}>
          返回上一页
        </Button>
      </Container>
    );
  }

  const copyTemplate = async (id: string, body: string) => {
    try {
      await navigator.clipboard.writeText(body);
      setCopiedId(id);
    } catch {
      setCopiedId('failed');
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="论坛分类"
        title={category.name}
        description={detail.summary}
        meta={
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-500">
            <Badge tone="brand">{category.mode}</Badge>
            <span>{category.purpose}</span>
          </div>
        }
        actions={
          <>
            <ExternalButton href={discussionCategoryUrl(category.slug)}>
              进入 GitHub 分类
            </ExternalButton>
            <Link to={forumPath()} className="link-inline self-center text-sm">
              返回论坛
            </Link>
          </>
        }
      />

      <Container className="py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="space-y-6">
            <section aria-labelledby="suitable-heading">
              <SectionHeading
                id="suitable-heading"
                eyebrow="发什么"
                title="适合与不适合的内容"
                description="分类边界用于减少错位发帖；不确定时可以先在 Q&A 提问。"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-surface p-4">
                  <h3 className="text-sm font-semibold text-ink-900">适合</h3>
                  <ul className="mt-2 space-y-1.5 text-sm leading-6 text-ink-700">
                    {detail.suitable.map((item) => (
                      <li key={item}>· {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-line bg-surface p-4">
                  <h3 className="text-sm font-semibold text-ink-900">不适合</h3>
                  <ul className="mt-2 space-y-1.5 text-sm leading-6 text-ink-700">
                    {detail.notSuitable.map((item) => (
                      <li key={item}>· {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section aria-labelledby="templates-heading">
              <SectionHeading
                id="templates-heading"
                eyebrow="发帖模板"
                title="复制模板，再补充你的信息"
                description="模板只是起点；请保留可核验的来源、限制与公开边界。"
              />
              <div className="space-y-4">
                {detail.templates.map((template) => (
                  <div key={template.id} className="rounded-xl border border-line bg-surface p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-ink-900">{template.title}</h3>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => copyTemplate(template.id, template.body)}
                      >
                        复制模板
                      </Button>
                    </div>
                    <pre className="mt-3 overflow-auto rounded-lg bg-navy-900 p-3 text-xs leading-5 text-white">
                      <code>{template.body}</code>
                    </pre>
                  </div>
                ))}
              </div>
              <p role="status" className="mt-2 text-xs text-brand-700">
                {copiedId === 'failed'
                  ? '复制失败，请手动选择文本。'
                  : copiedId
                    ? '模板已复制。'
                    : ''}
              </p>
            </section>
          </div>

          <aside className="space-y-4">
            <Alert tone="info" title="论坛在 GitHub，不在站内">
              站内不保存帖子正文、不提供账号或私信。点击“进入 GitHub 分类”后，在 GitHub
              登录并遵守社区行为准则。
            </Alert>
            <div className="rounded-xl border border-line bg-surface p-4">
              <h3 className="text-sm font-semibold text-ink-900">发帖前检查</h3>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-ink-700">
                <li>1. 先在 GitHub 搜索是否已有相同问题。</li>
                <li>2. 竞赛事实附官方链接与访问日期。</li>
                <li>3. 技术问题附最小复现与环境。</li>
                <li>4. 不公开手机号、身份证、住址或真实姓名。</li>
                <li>5. 组队与项目展示附公开联系方式或仓库。</li>
              </ul>
            </div>
            <div className="rounded-xl border border-line bg-surface p-4">
              <h3 className="text-sm font-semibold text-ink-900">相关站内入口</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {detail.related.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="link-inline">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/contribute" className="link-inline">
                    贡献指南
                  </Link>
                </li>
                <li>
                  <a
                    href={SITE.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-inline"
                  >
                    GitHub 仓库
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
