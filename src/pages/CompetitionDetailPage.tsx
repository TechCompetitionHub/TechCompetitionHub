import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { ButtonLink, ExternalButton } from '../components/Button';
import { Container, PageHeader, Breadcrumbs, SectionHeading } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { EmptyState, Alert } from '../components/States';
import { SourceList } from '../components/SourceList';
import { StatusBadge } from '../components/StatusBadge';
import { ExternalLink } from '../components/ExternalLink';
import { CompetitionScorePanel } from '../features/competitions/CompetitionScorePanel';
import { NotFoundPage } from './NotFoundPage';
import { formatDate, levelLabel } from '../lib/utils/format';
import {
  getAudienceLabel,
  getCompetitionById,
  getCompetitionSkills,
  getDomainLabel,
  getRelatedProjects,
} from '../services/competitionService';
import { issueTemplateUrl, SITE } from '../services/site';

const ROLE_LABELS: Record<string, string> = {
  host: '主办',
  organizer: '组织',
  'co-organizer': '承办/协办',
  secretariat: '秘书处/法人单位',
  sponsor: '赞助',
};

const DELIVERY_LABELS: Record<string, string> = {
  online: '线上',
  offline: '线下',
  hybrid: '线上线下混合',
};

const COST_LABELS: Record<string, string> = {
  free: '免费',
  verified: '已核验费用',
  estimated: '估算',
  unknown: '待核验',
  not_applicable: '不适用',
};

const SCHEDULE_LABELS: Record<string, string> = {
  confirmed: '已确认',
  partial: '部分核验',
  expected: '按惯例推测',
  unknown: '待核验',
  not_applicable: '不适用',
};

export function CompetitionDetailPage() {
  const { competitionId } = useParams();
  const competition = competitionId ? getCompetitionById(competitionId) : undefined;

  if (!competition) {
    return <NotFoundPage />;
  }

  const skills = getCompetitionSkills(competition);
  const projects = getRelatedProjects(competition.id);
  const teamLabel = competition.format.team_based
    ? competition.format.team_size
      ? `团队赛（${competition.format.team_size.min}–${competition.format.team_size.max} 人）`
      : '团队赛（人数待核验）'
    : '个人赛';

  return (
    <>
      <DetailMeta competitionName={competition.name} summary={competition.summary} />
      <PageHeader
        eyebrow="竞赛详情"
        title={competition.name}
        description={competition.summary}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={competition.verification_status} />
            {competition.domains.map((domain) => (
              <Badge key={domain} tone="brand">
                {getDomainLabel(domain)}
              </Badge>
            ))}
            <span className="text-xs text-ink-500">
              最后核验：{formatDate(competition.last_verified_at)}
            </span>
          </div>
        }
        actions={
          <>
            <ExternalButton href={competition.official_urls[0]?.url ?? SITE.repo}>
              官方入口
            </ExternalButton>
            <ButtonLink to={`/planner?target=competition:${competition.id}`} variant="secondary">
              用该竞赛生成路线
            </ButtonLink>
            <ExternalButton href={issueTemplateUrl('competition-correction.yml')} variant="ghost">
              纠错
            </ExternalButton>
          </>
        }
      />

      <Container className="py-8">
        <Breadcrumbs
          items={[
            { label: '首页', to: '/' },
            { label: '竞赛目录', to: '/competitions' },
            { label: competition.name },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
          <div className="space-y-10">
            <section aria-labelledby="overview-heading">
              <SectionHeading id="overview-heading" eyebrow="概览" title="这项竞赛考查什么" />
              <p className="text-base leading-8 whitespace-pre-line text-ink-700">
                {competition.description}
              </p>
            </section>

            <section aria-labelledby="facts-heading">
              <SectionHeading id="facts-heading" eyebrow="关键事实" title="先核对，再判断" />
              <dl className="grid gap-4 sm:grid-cols-2">
                <Fact label="主办/组织方">
                  {competition.organizers.length > 0 ? (
                    <ul className="space-y-1">
                      {competition.organizers.map((organizer) => (
                        <li key={`${organizer.name}-${organizer.role}`}>
                          <span className="text-ink-900">{organizer.name}</span>
                          <span className="ml-1 text-xs text-ink-500">
                            （{ROLE_LABELS[organizer.role] ?? organizer.role}）
                          </span>
                          {organizer.url ? (
                            <ExternalLink href={organizer.url} className="ml-1 text-xs">
                              链接
                            </ExternalLink>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-ink-500">待核验</span>
                  )}
                </Fact>
                <Fact label="适合对象">
                  {competition.audience.levels.map(getAudienceLabel).join(' / ')}
                  {competition.audience.notes ? (
                    <span className="mt-1 block text-xs text-ink-500">
                      {competition.audience.notes}
                    </span>
                  ) : null}
                </Fact>
                <Fact label="参赛形式">
                  {teamLabel}
                  <span className="mt-1 block text-xs text-ink-500">
                    {competition.format.delivery_modes
                      .map((mode) => DELIVERY_LABELS[mode] ?? mode)
                      .join(' / ')}
                  </span>
                </Fact>
                <Fact label="技术难度">
                  <span aria-label={`难度 ${competition.difficulty.level} / 5`}>
                    {'★'.repeat(competition.difficulty.level)}
                    {'☆'.repeat(5 - competition.difficulty.level)} · {competition.difficulty.level}
                    /5
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-ink-500">
                    {competition.difficulty.rationale}
                  </span>
                </Fact>
                <Fact label="费用状态">
                  {COST_LABELS[competition.estimated_cost.status] ??
                    competition.estimated_cost.status}
                  {competition.estimated_cost.amount !== null
                    ? ` · ${competition.estimated_cost.amount} ${competition.estimated_cost.currency}`
                    : ''}
                  {competition.estimated_cost.notes ? (
                    <span className="mt-1 block text-xs leading-5 text-ink-500">
                      {competition.estimated_cost.notes}
                    </span>
                  ) : null}
                </Fact>
                <Fact label="数据状态">
                  <StatusBadge status={competition.verification_status} />
                  <span className="mt-1 block text-xs text-ink-500">
                    最后核验 {formatDate(competition.last_verified_at)} · 来源{' '}
                    {competition.sources.length} 条
                  </span>
                </Fact>
              </dl>
              {competition.format.notes ? (
                <p className="mt-3 text-xs leading-5 text-ink-500">{competition.format.notes}</p>
              ) : null}
            </section>

            <section aria-labelledby="schedule-heading">
              <SectionHeading
                id="schedule-heading"
                eyebrow="时间信息"
                title="没有来源的日期不写成确定事实"
                description={competition.schedule.notes ?? undefined}
              />
              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">竞赛时间信息与核验状态</caption>
                  <thead className="bg-surface-muted text-xs text-ink-500">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        阶段
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        日期
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        状态
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-ink-700">
                    <ScheduleRow label="报名开始" value={competition.schedule.registration_start} />
                    <ScheduleRow label="报名结束" value={competition.schedule.registration_end} />
                    <ScheduleRow label="比赛开始" value={competition.schedule.event_start} />
                    <ScheduleRow label="比赛结束" value={competition.schedule.event_end} />
                    <tr>
                      <td className="px-4 py-3 font-medium">整体状态</td>
                      <td className="px-4 py-3 text-ink-500">—</td>
                      <td className="px-4 py-3">
                        {SCHEDULE_LABELS[competition.schedule.status] ??
                          competition.schedule.status}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <Alert tone="info" className="mt-3">
                页面只展示已记录年份的日期。报名状态、赛程变更与下一年度安排必须回到官方来源确认，平台不猜测“当前是否可报名”。
              </Alert>
            </section>

            <section aria-labelledby="skills-heading">
              <SectionHeading
                id="skills-heading"
                eyebrow="技能要求"
                title="需要补齐哪些能力"
                description="目标等级来自平台技能图谱；0–4 级是行为描述，不是认证。"
              />
              {skills.length > 0 ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {competition.skills_required.map((requirement) => {
                    const skill = skills.find((item) => item.id === requirement.skill_id);
                    return (
                      <li
                        key={requirement.skill_id}
                        className="rounded-xl border border-line bg-surface p-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            to={`/skills/${requirement.skill_id}`}
                            className="font-semibold text-ink-900 hover:text-brand-700"
                          >
                            {skill?.name ?? requirement.skill_id}
                          </Link>
                          <Badge tone="brand">目标 {levelLabel(requirement.target_level)}</Badge>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-ink-500">
                          {skill?.definition ?? '技能定义待补充'}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-ink-500">该竞赛暂未配置技能要求。</p>
              )}
            </section>

            <section aria-labelledby="score-heading">
              <SectionHeading
                id="score-heading"
                eyebrow="平台评分"
                title="分数必须可解释"
                description="评分为平台方法论下的编辑初评，不是官方排名。未知维度不会被当作 0 分或满分。"
              />
              <div className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
                <CompetitionScorePanel competition={competition} />
              </div>
            </section>

            <section aria-labelledby="sources-heading">
              <SectionHeading
                id="sources-heading"
                eyebrow="来源与核验"
                title="每条关键事实的来源"
                description="来源记录包含发布方、类型、访问日期与支持的字段。"
              />
              <SourceList sources={competition.sources} />
              {competition.notes ? (
                <Alert tone="warning" title="已知限制" className="mt-4">
                  {competition.notes}
                </Alert>
              ) : null}
            </section>

            <section aria-labelledby="projects-heading">
              <SectionHeading
                id="projects-heading"
                eyebrow="相关项目"
                title="可复现的项目成果"
                description="只有提交者提供证据并获得成员同意的项目才会展示；平台不为项目原创性或获奖真实性作保证。"
              />
              {projects.length > 0 ? (
                <ul className="space-y-3">
                  {projects.map((project) => (
                    <li key={project.id} className="rounded-xl border border-line bg-surface p-4">
                      <Link
                        to={`/projects/${project.id}`}
                        className="font-semibold hover:text-brand-700"
                      >
                        {project.title}
                      </Link>
                      <p className="mt-1 text-sm text-ink-500">{project.summary}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  compact
                  title="暂无已收录项目"
                  description="平台不会用示例项目冒充真实成果。如果你完成了与这项竞赛相关的可复现项目，欢迎按模板提交。"
                  action={
                    <ExternalButton href={issueTemplateUrl('project-submit.yml')}>
                      提交项目
                    </ExternalButton>
                  }
                />
              )}
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
              <h2 className="text-sm font-bold text-ink-900">官方入口</h2>
              <ul className="mt-3 space-y-2">
                {competition.official_urls.map((item) => (
                  <li key={item.url}>
                    <ExternalLink href={item.url} className="text-sm">
                      {item.label}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
              <div className="mt-5 border-t border-line pt-4">
                <h2 className="text-sm font-bold text-ink-900">发现错误？</h2>
                <p className="mt-1 text-xs leading-5 text-ink-500">
                  请提供字段、当前值、建议值与来源。事实错误优先修正；评分争议进入公开讨论。
                </p>
                <ExternalButton
                  href={issueTemplateUrl('competition-correction.yml')}
                  variant="secondary"
                  size="sm"
                  className="mt-3 w-full"
                >
                  提交纠错 Issue
                </ExternalButton>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-brand-50 p-5">
              <h2 className="text-sm font-bold text-ink-900">社区讨论</h2>
              <p className="mt-1 text-xs leading-5 text-ink-700">
                经验、组队与技术问答在 GitHub Discussions 中进行；站内不保存聊天记录。
              </p>
              <ExternalLink href={SITE.discussions} className="mt-3 inline-block text-sm">
                前往 Discussions
              </ExternalLink>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-sm font-bold text-ink-900">数据责任</h2>
              <p className="mt-1 text-xs leading-5 text-ink-500">
                本页竞赛事实来自上方来源，评分为平台初评。平台不是主办方，不提供报名服务，也不保证信息永久有效。
              </p>
              <Link to="/data-policy" className="link-inline mt-3 inline-block text-xs">
                阅读数据政策
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <dt className="text-xs font-semibold tracking-wide text-ink-500 uppercase">{label}</dt>
      <dd className="mt-1.5 text-sm leading-6 text-ink-900">{children}</dd>
    </div>
  );
}

function ScheduleRow({ label, value }: { label: string; value: string | null }) {
  return (
    <tr>
      <td className="px-4 py-3 font-medium">{label}</td>
      <td className="px-4 py-3">
        {value ? (
          <time dateTime={value}>{formatDate(value)}</time>
        ) : (
          <span className="text-ink-500">待核验</span>
        )}
      </td>
      <td className="px-4 py-3 text-ink-500">{value ? '有日期记录' : '无可靠日期'}</td>
    </tr>
  );
}

function DetailMeta({ competitionName, summary }: { competitionName: string; summary: string }) {
  usePageMeta({
    title: competitionName,
    description: `${summary} 查看官方来源、核验状态、技能要求与平台评分方法。`,
  });
  return null;
}
