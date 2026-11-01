import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Button, ButtonLink, ExternalButton } from '../components/Button';
import { Card, CardBody } from '../components/Card';
import { Container, Section, SectionHeading } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { EmptyState } from '../components/States';
import { CompetitionCard } from '../features/competitions/CompetitionCard';
import { formatDate, formatScore } from '../lib/utils/format';
import {
  countOfficialRankedCompetitions,
  countScoredCompetitions,
  countVerifiedCompetitions,
  getDomainOptions,
  getValueRanking,
  listCompetitions,
} from '../services/competitionService';
import { getGuidesByCategory } from '../services/contentService';
import { countFreeResources } from '../services/resourceService';
import { listSkills } from '../services/skillService';
import { SITE } from '../services/site';

export function HomePage() {
  usePageMeta({
    title: '大学生科技竞赛开源成长平台',
    description:
      '可追溯的竞赛目录、公开的评分方法、技能图谱与规则式成长规划。所有竞赛数据标注来源与核验状态，不使用虚构数据。',
  });

  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const competitions = listCompetitions();
  const ranking = getValueRanking();
  const domains = getDomainOptions();
  const guides = getGuidesByCategory('guide');
  const verified = countVerifiedCompetitions();
  const scored = countScoredCompetitions();
  const ranked = countOfficialRankedCompetitions();
  const skills = listSkills();
  const freeResources = countFreeResources();

  const rankingPreview = ranking.entries.slice(0, 3);
  const featured = (
    rankingPreview.length > 0
      ? rankingPreview.map((entry) => entry.competition)
      : [...competitions]
          .sort((a, b) => (b.last_verified_at ?? '').localeCompare(a.last_verified_at ?? ''))
          .slice(0, 3)
  ).slice(0, 3);

  return (
    <>
      <section className="border-b border-line bg-navy-900 text-white">
        <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="brand" className="border-white/15 bg-white/10 text-white">
                开源 · 数据可追溯
              </Badge>
              <Badge tone="neutral" className="border-white/15 bg-white/5 text-white/80">
                无需注册
              </Badge>
            </div>
            <h1 className="mt-5 text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
              把“参加什么竞赛”
              <br />
              变成一份可执行的成长路线。
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75">
              TechCompetitionHub
              用结构化数据记录竞赛事实，用公开方法解释价值评分，用技能图谱和规则引擎生成学习计划。评分不是官方认定，竞赛信息以官方来源为准。
            </p>

            <form
              className="mt-7 flex max-w-2xl flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                const trimmed = query.trim();
                navigate(
                  trimmed ? `/competitions?q=${encodeURIComponent(trimmed)}` : '/competitions',
                );
              }}
            >
              <label htmlFor="home-search" className="sr-only">
                搜索竞赛名称、领域或关键词
              </label>
              <input
                id="home-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索竞赛、技术领域或关键词，如“嵌入式”“数学建模”"
                className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none"
              />
              <Button type="submit" className="bg-brand-500 hover:bg-brand-600">
                搜索竞赛
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink
                to="/planner"
                variant="secondary"
                className="border-white/25 bg-white/10 text-white hover:border-white/50 hover:text-white"
              >
                制定成长路线
              </ButtonLink>
              <ButtonLink
                to="/rankings"
                variant="ghost"
                className="text-white/85 hover:bg-white/10 hover:text-white"
              >
                查看价值榜
              </ButtonLink>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-white/15 bg-white/5 p-5">
            <div className="rounded-xl bg-white/5 p-4">
              <dt className="text-xs text-white/60">已收录竞赛</dt>
              <dd className="mt-1 text-2xl font-bold">{competitions.length}</dd>
              <dd className="mt-1 text-[11px] text-white/50">真实仓库数据</dd>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <dt className="text-xs text-white/60">已核验</dt>
              <dd className="mt-1 text-2xl font-bold">{verified}</dd>
              <dd className="mt-1 text-[11px] text-white/50">有官方来源</dd>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <dt className="text-xs text-white/60">已评分</dt>
              <dd className="mt-1 text-2xl font-bold">{scored}</dd>
              <dd className="mt-1 text-[11px] text-white/50">其中 {ranked} 条进入正式榜</dd>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <dt className="text-xs text-white/60">技能 / 免费资源</dt>
              <dd className="mt-1 text-2xl font-bold">
                {skills.length} / {freeResources}
              </dd>
              <dd className="mt-1 text-[11px] text-white/50">可执行任务与真实链接</dd>
            </div>
          </dl>
        </Container>
      </section>

      <Section labelledBy="domains-heading">
        <Container>
          <SectionHeading
            id="domains-heading"
            eyebrow="按领域探索"
            title="从你关心的技术方向开始"
            description="领域使用受控词表，避免同一方向被拆成多个标签。数量来自当前仓库真实数据。"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {domains.slice(0, 8).map((domain) => (
              <Link
                key={domain.id}
                to={`/competitions?domain=${domain.id}`}
                className="group rounded-xl border border-line bg-surface p-4 shadow-card transition-colors hover:border-brand-500/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-ink-900 group-hover:text-brand-700">
                    {domain.label}
                  </span>
                  <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-ink-500">
                    {domain.count}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-ink-500">
                  {domain.description}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-y border-line bg-surface" labelledBy="featured-heading">
        <Container>
          <SectionHeading
            id="featured-heading"
            eyebrow="竞赛预览"
            title="先看数据，再看排名"
            description="卡片展示数据状态、核验日期和评分状态。未核验的信息不会被写成确定事实。"
            action={
              <ButtonLink to="/competitions" variant="secondary">
                全部竞赛
              </ButtonLink>
            }
          />
          {featured.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((competition) => {
                const entry = rankingPreview.find((item) => item.competition.id === competition.id);
                return (
                  <CompetitionCard
                    key={competition.id}
                    competition={competition}
                    score={entry?.score}
                    rank={entry?.rank}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="竞赛数据尚未导入"
              description="仓库还没有通过 Schema 校验的公开竞赛条目。请先按贡献指南提交数据，或运行数据校验脚本。"
              action={<ButtonLink to="/contribute">查看贡献指南</ButtonLink>}
            />
          )}
        </Container>
      </Section>

      <Section labelledBy="ranking-heading">
        <Container className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeading
              id="ranking-heading"
              eyebrow="价值榜预览"
              title="分数必须能解释"
              description={`当前模型 v${ranking.model.version}，仅 ${ranked} 条满足正式排名准入。维度、权重和证据状态全部公开。`}
              action={
                <ButtonLink to="/rankings" variant="secondary">
                  完整榜单
                </ButtonLink>
              }
            />
            {rankingPreview.length > 0 ? (
              <ol className="divide-y divide-line rounded-2xl border border-line bg-surface shadow-card">
                {rankingPreview.map((entry) => (
                  <li key={entry.competition.id} className="flex items-center gap-4 p-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">
                      {entry.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/competitions/${entry.competition.id}`}
                        className="font-semibold hover:text-brand-700"
                      >
                        {entry.competition.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {entry.tied ? '并列 · ' : ''}核验{' '}
                        {formatDate(entry.competition.last_verified_at)} · 证据置信度{' '}
                        {entry.confidence ?? '未知'}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-brand-700">
                      {formatScore(entry.score)}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState
                title="暂无满足准入条件的条目"
                description="正式排名要求数据已核验、评分已审核、全部维度有依据。当前数据可能仍在补充评分，平台不会用虚构分数填满榜单。"
                action={
                  <ButtonLink to="/scoring-method" variant="secondary">
                    阅读评分方法
                  </ButtonLink>
                }
              />
            )}
          </div>

          <Card>
            <CardBody>
              <p className="text-xs font-bold tracking-[0.18em] text-brand-700 uppercase">
                评分怎么看
              </p>
              <h3 className="mt-2 text-xl font-bold text-ink-900">总分不是唯一信息</h3>
              <p className="mt-2 text-sm leading-6 text-ink-500">
                平台评分由六个维度加权构成。未知维度不会被当作 0
                分或满分；资料不足的条目会单独列出，不参与正式排名。
              </p>
              <dl className="mt-5 space-y-3">
                {ranking.model.dimensions.map((dimension) => (
                  <div key={dimension.id} className="flex items-start justify-between gap-4">
                    <dt className="text-sm text-ink-700">{dimension.name}</dt>
                    <dd className="shrink-0 text-sm font-semibold text-ink-900">
                      {(dimension.weight * 100).toFixed(0)}%
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 border-t border-line pt-4">
                <Link to="/scoring-method" className="link-inline text-sm">
                  查看完整方法、缺失数据规则与版本记录
                </Link>
              </div>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <Section className="border-y border-line bg-surface" labelledBy="planner-heading">
        <Container className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeading
              id="planner-heading"
              eyebrow="成长规划"
              title="用确定性规则，而不是黑箱建议"
              description="选择目标竞赛或方向，勾选自评技能和每周可投入时间。系统按技能依赖排序，输出任务、产出物和验收标准；没有可靠资源时明确标注“待补充”。"
            />
            <div className="flex flex-wrap gap-3">
              <ButtonLink to="/planner">开始规划</ButtonLink>
              <ButtonLink to="/skills" variant="secondary">
                浏览技能图谱
              </ButtonLink>
            </div>
          </div>
          <Card className="bg-brand-50">
            <CardBody>
              <h3 className="font-semibold text-ink-900">平台不承诺什么</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-ink-700">
                <li>· 不承诺获奖、保研或就业结果。</li>
                <li>· 不把自评等级包装成已验证能力。</li>
                <li>· 不生成虚构资源链接或精确日程。</li>
              </ul>
              <Link to="/privacy" className="link-inline mt-4 inline-block text-sm">
                了解隐私与数据处理
              </Link>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <Section labelledBy="community-heading">
        <Container className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardBody>
              <SectionHeading
                id="community-heading"
                eyebrow="社区与经验"
                title="把踩过的坑写下来"
                description={`${guides.length} 篇原创指南，覆盖选赛、备赛复盘与项目可复现性。经验文章是社区观点，不替代官方规则。`}
              />
              {guides.length > 0 ? (
                <ul className="space-y-3">
                  {guides.slice(0, 3).map((guide) => (
                    <li key={guide.slug}>
                      <Link
                        to={`/guides/${guide.slug}`}
                        className="font-medium hover:text-brand-700"
                      >
                        {guide.frontmatter.title}
                      </Link>
                      <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">
                        {guide.frontmatter.summary}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-500">指南内容正在整理中。</p>
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink to="/guides" variant="secondary" size="sm">
                  阅读指南
                </ButtonLink>
                <ExternalButton href={SITE.discussions} size="sm">
                  前往 Discussions
                </ExternalButton>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-xs font-bold tracking-[0.18em] text-brand-700 uppercase">
                参与贡献
              </p>
              <h2 className="mt-2 text-xl font-bold text-ink-900">
                修正一条事实，比写一句口号更有用
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-500">
                新增竞赛、纠错、提交项目或补充技能任务都通过 Issue 与 PR 管理。CI 会校验
                Schema、重复 ID、引用关系、评分权重与构建。
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <ButtonLink to="/contribute" size="sm">
                  贡献指南
                </ButtonLink>
                <ButtonLink to="/data-policy" variant="secondary" size="sm">
                  数据政策
                </ButtonLink>
              </div>
              <p className="mt-4 text-xs text-ink-500">
                当前数据：{competitions.length} 条竞赛，{verified} 条已核验，{scored}{' '}
                条已评分。数字来自仓库，不使用虚构统计。
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <section className="border-t border-line bg-navy-900 py-6 text-white">
        <Container className="flex flex-col gap-2 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>平台评分为社区方法论评估，不是官方排名、认证或对个人结果的预测。</p>
          <a
            href={`${SITE.repo}/blob/main/docs/SCORING_METHODOLOGY.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            阅读评分方法与限制
            <span className="sr-only">（在新标签页打开）</span>
          </a>
        </Container>
      </section>
    </>
  );
}
