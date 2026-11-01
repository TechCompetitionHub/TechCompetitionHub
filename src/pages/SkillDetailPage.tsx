import { Link, useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { ButtonLink } from '../components/Button';
import { ExternalLink } from '../components/ExternalLink';
import { Container, PageHeader, SectionHeading, Breadcrumbs } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { EmptyState } from '../components/States';
import { NotFoundPage } from './NotFoundPage';
import { formatDate, formatHours, levelLabel } from '../lib/utils/format';
import {
  getDependents,
  getPrerequisites,
  getSkillById,
  getSkillCompetitions,
  getSkillDomainLabel,
  getSkillResources,
} from '../services/skillService';

export function SkillDetailPage() {
  const { skillId } = useParams();
  const skill = skillId ? getSkillById(skillId) : undefined;

  if (!skill) {
    return <NotFoundPage />;
  }

  const prerequisites = getPrerequisites(skill);
  const dependents = getDependents(skill);
  const resources = getSkillResources(skill);
  const competitions = getSkillCompetitions(skill);

  return (
    <>
      <SkillMeta name={skill.name} definition={skill.definition} />
      <PageHeader
        eyebrow={getSkillDomainLabel(skill.domain)}
        title={skill.name}
        description={skill.definition}
        meta={
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
            <Badge tone="brand">更新 {formatDate(skill.updated_at)}</Badge>
            <span>维护者：{skill.maintainer}</span>
          </div>
        }
        actions={
          <ButtonLink to="/planner" variant="secondary">
            用技能图谱做规划
          </ButtonLink>
        }
      />

      <Container className="py-8">
        <Breadcrumbs
          items={[
            { label: '首页', to: '/' },
            { label: '技能图谱', to: '/skills' },
            { label: skill.name },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
          <div className="space-y-10">
            <section aria-labelledby="levels-heading">
              <SectionHeading
                id="levels-heading"
                eyebrow="行为等级"
                title="L0–L4 分别意味着什么"
                description="等级是规划用的能力框架，不是认证。自评、导师评价与项目证据应分开记录。"
              />
              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">{skill.name} 的行为等级描述</caption>
                  <thead className="bg-surface-muted text-xs text-ink-500">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        等级
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        可观察行为
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {skill.levels.map((level) => (
                      <tr key={level.level}>
                        <th
                          scope="row"
                          className="w-40 px-4 py-3 text-left align-top font-semibold"
                        >
                          {level.label}
                        </th>
                        <td className="px-4 py-3 leading-6 text-ink-700">{level.behavior}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="tasks-heading">
              <SectionHeading
                id="tasks-heading"
                eyebrow="可验证任务"
                title="用产出物而不是口号证明能力"
                description="每个任务包含目标、前置条件、步骤、产出物、验收标准、预计工时与常见失败。"
              />
              <div className="space-y-4">
                {skill.practice_tasks.map((task) => (
                  <article key={task.id} className="rounded-2xl border border-line bg-surface p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-ink-900">{task.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone="brand">{levelLabel(task.level)}</Badge>
                        <Badge tone="neutral">{formatHours(task.estimated_hours)}</Badge>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink-700">{task.goal}</p>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="text-xs font-bold tracking-wide text-ink-500 uppercase">
                          前置条件
                        </h4>
                        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-700">
                          {task.prerequisites.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold tracking-wide text-ink-500 uppercase">
                          操作步骤
                        </h4>
                        <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-sm leading-6 text-ink-700">
                          {task.steps.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ol>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold tracking-wide text-ink-500 uppercase">
                          产出物
                        </h4>
                        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-700">
                          {task.deliverables.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold tracking-wide text-ink-500 uppercase">
                          验收标准
                        </h4>
                        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-700">
                          {task.acceptance_criteria.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <details className="mt-4 border-t border-line pt-3">
                      <summary className="cursor-pointer text-xs font-semibold text-ink-500">
                        常见失败与排查方向
                      </summary>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-700">
                        {task.common_failures.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </details>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="resources-heading">
              <SectionHeading
                id="resources-heading"
                eyebrow="学习资源"
                title="只列真实可访问的链接"
                description="资源保留标题、发布方、访问条款与最后检查日期；没有可靠资源时明确显示“待补充”。"
              />
              {resources.length > 0 ? (
                <ul className="space-y-3">
                  {resources.map((resource) => (
                    <li key={resource.id} className="rounded-xl border border-line bg-surface p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <ExternalLink href={resource.url} className="font-semibold">
                          {resource.title}
                        </ExternalLink>
                        <div className="flex gap-2">
                          <Badge tone={resource.free_status === 'free' ? 'success' : 'warning'}>
                            {resource.free_status === 'free'
                              ? '免费'
                              : resource.free_status === 'freemium'
                                ? '部分免费'
                                : resource.free_status === 'paid'
                                  ? '付费'
                                  : '费用未知'}
                          </Badge>
                          <Badge tone="neutral">{resource.language}</Badge>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-ink-500">
                        {resource.publisher} · 类型 {resource.resource_type} · 最后检查{' '}
                        {formatDate(resource.last_checked_at)}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-ink-500">
                        {resource.license_or_access_terms}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  compact
                  title="暂无可靠学习资源"
                  description="平台不会为这个技能编造链接。欢迎通过贡献流程补充可访问、来源明确的资源。"
                />
              )}
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
              <h2 className="text-sm font-bold text-ink-900">前置技能</h2>
              {prerequisites.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {prerequisites.map((item) => (
                    <li key={item.id}>
                      <Link to={`/skills/${item.id}`} className="link-inline text-sm">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink-500">无前置技能，可以从这里开始。</p>
              )}

              <h2 className="mt-5 border-t border-line pt-4 text-sm font-bold text-ink-900">
                后续技能
              </h2>
              {dependents.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {dependents.map((item) => (
                    <li key={item.id}>
                      <Link to={`/skills/${item.id}`} className="link-inline text-sm">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink-500">暂无技能把它列为前置。</p>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-sm font-bold text-ink-900">关联竞赛</h2>
              {competitions.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {competitions.map((competition) => (
                    <li key={competition.id}>
                      <Link
                        to={`/competitions/${competition.id}`}
                        className="text-sm font-medium text-ink-900 hover:text-brand-700"
                      >
                        {competition.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink-500">暂无关联竞赛。</p>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-brand-50 p-5">
              <h2 className="text-sm font-bold text-ink-900">自评提醒</h2>
              <p className="mt-1 text-xs leading-5 text-ink-700">
                自评等级只用于生成学习路线。它不会自动成为“已验证能力”，也不应被当作求职或保研证明。
              </p>
              <Link to="/privacy" className="link-inline mt-3 inline-block text-xs">
                了解数据处理方式
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}

function SkillMeta({ name, definition }: { name: string; definition: string }) {
  usePageMeta({
    title: name,
    description: `${definition} 查看 L0–L4 行为描述、前置技能、可验证任务与学习资源。`,
  });
  return null;
}
