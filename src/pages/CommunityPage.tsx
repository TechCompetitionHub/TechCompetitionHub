import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Button, ButtonLink, ExternalButton } from '../components/Button';
import { Container, PageHeader, SectionHeading } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { Alert } from '../components/States';
import { ExternalLink } from '../components/ExternalLink';
import { listGuides } from '../services/contentService';
import {
  COMMUNITY_CATEGORIES,
  discussionCategoryNote,
  discussionSearchUrl,
  forumPath,
  issueTemplateUrl,
  SITE,
} from '../services/site';
import { formatDate } from '../lib/utils/format';

export function CommunityPage() {
  usePageMeta({
    title: '论坛',
    description:
      'TechCompetitionHub 论坛：通过 GitHub Discussions 参与竞赛咨询、备赛经验、技术问答、组队与项目展示；站内提供分类说明、发帖模板与行为准则。',
  });

  const guides = listGuides().slice(0, 3);
  const [query, setQuery] = useState('');

  const searchForum = () => {
    const target = query.trim() ? discussionSearchUrl(query.trim()) : SITE.discussions;
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <PageHeader
        eyebrow="论坛"
        title="在公开、可搜索的地方交流"
        description="论坛以 GitHub Discussions 承载：经验、问答、组队与项目展示可搜索、可引用、可追溯。站内不保存帖子正文，也不建设私信或即时聊天。"
        actions={
          <>
            <ExternalButton href={SITE.discussions}>前往 GitHub 论坛</ExternalButton>
            <ButtonLink to="/submit-review" variant="secondary">
              提交参赛评价
            </ButtonLink>
            <ButtonLink to="/guides" variant="ghost">
              阅读经验指南
            </ButtonLink>
          </>
        }
      />

      <Container className="py-8">
        <Alert tone="success" title="Discussions 已启用">
          {discussionCategoryNote()} 站内只链接当前实际存在的分类，不伪造分类地址。
        </Alert>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:flex-row sm:items-center">
          <img
            src={`${import.meta.env.BASE_URL}forum-avatar.jpg`}
            alt="TechCompetitionHub 论坛头像"
            width={96}
            height={96}
            className="size-20 shrink-0 rounded-2xl object-cover sm:size-24"
          />
          <div>
            <p className="text-base font-semibold text-ink-900">TechCompetitionHub 论坛</p>
            <p className="mt-1 text-sm leading-6 text-ink-500">
              论坛头像由维护者设计。帖子与问答在 GitHub Discussions
              中；站内展示分类入口、发帖模板与参赛评价入口，不镜像帖子正文。
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              searchForum();
            }}
          >
            <label htmlFor="forum-search" className="sr-only">
              搜索 GitHub Discussions
            </label>
            <input
              id="forum-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索论坛帖子，如“电赛 控制”“组队 嵌入式”"
              className="min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none"
            />
            <Button type="submit">搜索论坛</Button>
          </form>
          <p className="mt-2 text-xs leading-5 text-ink-500">
            搜索会在 GitHub Discussions 中打开，不在站内建立帖子索引；帖子正文与账号仍由 GitHub
            管理。
          </p>
        </div>

        <section className="mt-10" aria-labelledby="categories-heading">
          <SectionHeading
            id="categories-heading"
            eyebrow="分类入口"
            title="每个分类只解决一类问题"
            description="点击分类进入站内说明页，查看适用内容与发帖模板；右侧可直接去 GitHub 分类。"
          />
          <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">当前 Discussions 分类与用途</caption>
              <thead className="bg-surface-muted text-xs text-ink-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    分类
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    用途
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    形式
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    入口
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {COMMUNITY_CATEGORIES.map((category) => (
                  <tr key={category.name}>
                    <th scope="row" className="px-4 py-3 text-left font-semibold text-ink-900">
                      <Link to={forumPath(category.slug)} className="hover:text-brand-700">
                        {category.name}
                      </Link>
                    </th>
                    <td className="px-4 py-3 text-ink-700">{category.purpose}</td>
                    <td className="px-4 py-3 text-ink-500">{category.mode}</td>
                    <td className="px-4 py-3">
                      <ExternalLink href={category.url} className="text-xs">
                        GitHub
                      </ExternalLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="rules-heading">
            <SectionHeading
              id="rules-heading"
              eyebrow="社区规则"
              title="这些内容会被移除"
              description="规则同样适用于 Issue、PR 与 Discussions。"
            />
            <ul className="space-y-2 rounded-2xl border border-line bg-surface p-5 text-sm leading-6 text-ink-700">
              <li>· 伪造获奖、参赛经历或项目成果；</li>
              <li>· 代写、代做、买卖奖项或鼓励学术不端；</li>
              <li>· 未经授权上传他人源码、论文、课程材料；</li>
              <li>· 发布手机号、身份证、住址等个人敏感信息；</li>
              <li>· 骚扰、人身攻击、广告刷屏或操纵排名；</li>
              <li>· 把未经证实的指控当作事实传播。</li>
            </ul>
            <p className="mt-3 text-xs leading-5 text-ink-500">
              完整条款见仓库中的{' '}
              <ExternalLink href={`${SITE.repo}/blob/main/CODE_OF_CONDUCT.md`} className="text-xs">
                CODE_OF_CONDUCT.md
              </ExternalLink>
              。
            </p>
          </section>

          <section aria-labelledby="templates-heading">
            <SectionHeading
              id="templates-heading"
              eyebrow="投稿入口"
              title="用模板减少来回沟通"
              description="Issue 模板会要求来源、字段、证据与确认项。"
            />
            <ul className="space-y-3">
              <li className="rounded-xl border border-line bg-surface p-4">
                <ExternalLink
                  href={issueTemplateUrl('competition-add.yml')}
                  className="font-semibold"
                >
                  新增竞赛
                </ExternalLink>
                <p className="mt-1 text-xs text-ink-500">提供官方名称、来源、领域与核验日期。</p>
              </li>
              <li className="rounded-xl border border-line bg-surface p-4">
                <ExternalLink
                  href={issueTemplateUrl('competition-correction.yml')}
                  className="font-semibold"
                >
                  竞赛信息纠错
                </ExternalLink>
                <p className="mt-1 text-xs text-ink-500">提供字段、当前值、建议值与来源。</p>
              </li>
              <li className="rounded-xl border border-line bg-surface p-4">
                <ExternalLink
                  href={issueTemplateUrl('project-submit.yml')}
                  className="font-semibold"
                >
                  项目提交
                </ExternalLink>
                <p className="mt-1 text-xs text-ink-500">提供复现步骤、证据、许可证与成员同意。</p>
              </li>
              <li className="rounded-xl border border-line bg-surface p-4">
                <ExternalLink
                  href={issueTemplateUrl('skill-resource-suggestion.yml')}
                  className="font-semibold"
                >
                  技能/资源建议
                </ExternalLink>
                <p className="mt-1 text-xs text-ink-500">
                  说明适用技能、来源、访问条款与免费状态。
                </p>
              </li>
            </ul>
          </section>
        </div>

        <section className="mt-10" aria-labelledby="guides-heading">
          <SectionHeading
            id="guides-heading"
            eyebrow="先读再问"
            title="最新经验指南"
            description="很多问题在指南里已经有可执行答案。"
            action={
              <ButtonLink to="/guides" variant="secondary" size="sm">
                全部指南
              </ButtonLink>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            {guides.map((guide) => (
              <article key={guide.slug} className="rounded-2xl border border-line bg-surface p-5">
                <Badge tone="brand">指南</Badge>
                <h3 className="mt-3 font-bold text-ink-900">
                  <Link to={`/guides/${guide.slug}`} className="hover:text-brand-700">
                    {guide.frontmatter.title}
                  </Link>
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-ink-500">
                  {guide.frontmatter.summary}
                </p>
                <p className="mt-3 text-xs text-ink-500">
                  更新 {formatDate(guide.frontmatter.updated_at)}
                </p>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}
