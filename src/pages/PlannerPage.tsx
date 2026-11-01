import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Field, Select, TextInput } from '../components/Fields';
import { Container, PageHeader, SectionHeading } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { Alert, EmptyState } from '../components/States';
import { ExternalLink } from '../components/ExternalLink';
import {
  buildGrowthPlan,
  planToMarkdown,
  type GrowthPlan,
  type GrowthPlanResult,
} from '../lib/domain/roadmap';
import { topologicalSortSkills } from '../lib/domain/skillGraph';
import { formatHours, levelLabel } from '../lib/utils/format';
import { getPlannerTargets, type PlannerTarget } from '../services/roadmapService';
import { listResources } from '../services/resourceService';
import { listSkills } from '../services/skillService';

const LEVEL_OPTIONS = [0, 1, 2, 3, 4] as const;

export function PlannerPage() {
  usePageMeta({
    title: '成长规划',
    description:
      '选择目标竞赛或方向，填写技能自评与每周时间预算，用确定性规则生成技能缺口、阶段任务、验收标准与可复制 Markdown 计划。',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const targets = getPlannerTargets();
  const targetParam = searchParams.get('target');
  const selected =
    targets.find((target) => `${target.type}:${target.id}` === targetParam) ?? targets[0] ?? null;

  return (
    <>
      <PageHeader
        eyebrow="成长规划"
        title="把目标拆成下一步能做的事"
        description="规则引擎读取目标技能、前置依赖与你的自评，输出阶段任务、产出物和验收标准。没有外部 API，没有黑箱推荐；没有时间预算就不编造精确日程。"
        meta={
          <p className="text-sm text-ink-500">
            当前可规划目标：{targets.length} 个（竞赛与方向模板）。
          </p>
        }
      />

      <Container className="py-8">
        <h2 className="sr-only">规划工作区</h2>
        {selected ? (
          <>
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <Field
                  label="选择目标"
                  htmlFor="planner-target"
                  hint="目标技能来自竞赛数据或路线模板；前置技能会自动展开。"
                >
                  <Select
                    id="planner-target"
                    value={`${selected.type}:${selected.id}`}
                    onChange={(event) => {
                      setSearchParams({ target: event.target.value }, { replace: true });
                    }}
                  >
                    {targets.map((target) => (
                      <option
                        key={`${target.type}:${target.id}`}
                        value={`${target.type}:${target.id}`}
                      >
                        {target.type === 'competition' ? '竞赛' : '方向'} · {target.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="text-sm">
                  {selected.type === 'competition' ? (
                    <Link to={selected.href} className="link-inline">
                      查看目标竞赛
                    </Link>
                  ) : (
                    <Link to="/skills" className="link-inline">
                      浏览技能图谱
                    </Link>
                  )}
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-500">{selected.description}</p>
            </div>

            <PlannerWorkbench key={`${selected.type}:${selected.id}`} target={selected} />
          </>
        ) : (
          <EmptyState
            title="暂无可规划目标"
            description="竞赛或路线模板还没有配置目标技能。请先为竞赛补充 skills_required，或添加路线模板。"
          />
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-surface p-4">
            <h2 className="text-sm font-bold text-ink-900">自评不是认证</h2>
            <p className="mt-1 text-xs leading-5 text-ink-500">
              当前等级来自你的自评；平台不会把它上传、换算成个人总分或包装成已验证能力。
            </p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <h2 className="text-sm font-bold text-ink-900">没有可靠资源就留空</h2>
            <p className="mt-1 text-xs leading-5 text-ink-500">
              技能没有配置资源时，计划显示“待补充”，不会生成虚构链接。
            </p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <h2 className="text-sm font-bold text-ink-900">没有时间预算就不排日程</h2>
            <p className="mt-1 text-xs leading-5 text-ink-500">
              未填写每周小时数时，计划只给阶段顺序；填写后才按已知工时估算周次。
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}

function PlannerWorkbench({ target }: { target: PlannerTarget }) {
  const allSkills = listSkills();
  const allResources = listResources();
  const skillMap = useMemo(() => new Map(allSkills.map((skill) => [skill.id, skill])), [allSkills]);

  const ordered = useMemo(() => {
    const graph = topologicalSortSkills(
      target.targetSkills.map((item) => item.skillId),
      allSkills,
    );
    return {
      skills: graph.order
        .map((id) => skillMap.get(id))
        .filter((skill): skill is NonNullable<typeof skill> => skill !== undefined),
      cycle: graph.cycle,
      missing: graph.missing,
    };
  }, [target, allSkills, skillMap]);

  const explicitTargets = useMemo(
    () => new Map(target.targetSkills.map((item) => [item.skillId, item.targetLevel])),
    [target],
  );

  const [selfAssessment, setSelfAssessment] = useState<Record<string, number>>({});
  const [weeklyHours, setWeeklyHours] = useState('');
  const [plannedWeeks, setPlannedWeeks] = useState('');
  const [plan, setPlan] = useState<GrowthPlanResult | null>(null);
  const [copyStatus, setCopyStatus] = useState('');

  const generate = () => {
    const hours = weeklyHours.trim() === '' ? null : Number(weeklyHours);
    const weeks = plannedWeeks.trim() === '' ? null : Number(plannedWeeks);
    setPlan(
      buildGrowthPlan({
        targetName: target.name,
        targetSkills: target.targetSkills,
        selfAssessment,
        skills: allSkills,
        resources: allResources,
        weeklyHours: Number.isFinite(hours) ? hours : null,
        plannedWeeks: Number.isFinite(weeks) ? weeks : null,
      }),
    );
    setCopyStatus('');
  };

  const copyMarkdown = async (value: GrowthPlan) => {
    const markdown = planToMarkdown(value);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(markdown);
        setCopyStatus('已复制 Markdown 计划到剪贴板。');
      } else {
        setCopyStatus('当前浏览器不支持剪贴板 API，请使用“下载 Markdown”。');
      }
    } catch {
      setCopyStatus('复制失败，请使用“下载 Markdown”。');
    }
  };

  const downloadMarkdown = (value: GrowthPlan) => {
    const markdown = planToMarkdown(value);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${target.id}-growth-plan.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    setCopyStatus('已生成 Markdown 下载。');
  };

  if (ordered.cycle) {
    return (
      <Alert tone="danger" title="技能依赖存在循环" className="mt-6">
        无法生成路线：{ordered.cycle.join(' → ')}。请先修正技能图谱中的前置关系。
      </Alert>
    );
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section
        className="rounded-2xl border border-line bg-surface p-5 shadow-card"
        aria-labelledby="assessment-heading"
      >
        <SectionHeading
          id="assessment-heading"
          eyebrow="第 1 步"
          title="技能自评"
          description="只用于本次规划，不上传。0–4 级是行为描述；请按真实情况填写。"
        />

        {ordered.missing.length > 0 ? (
          <Alert tone="warning" title="目标引用了不存在的技能" className="mb-4">
            {ordered.missing.join('、')}
          </Alert>
        ) : null}

        <fieldset className="space-y-4">
          <legend className="sr-only">技能自评等级</legend>
          {ordered.skills.map((skill) => {
            const explicitTarget = explicitTargets.get(skill.id);
            return (
              <div key={skill.id} className="rounded-xl border border-line p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link
                      to={`/skills/${skill.id}`}
                      className="text-sm font-semibold hover:text-brand-700"
                    >
                      {skill.name}
                    </Link>
                    <span className="ml-2 text-xs text-ink-500">
                      {explicitTarget !== undefined
                        ? `目标 ${levelLabel(explicitTarget)}`
                        : '前置技能（目标由依赖推导）'}
                    </span>
                  </div>
                  <label htmlFor={`level-${skill.id}`} className="sr-only">
                    {skill.name} 当前自评等级
                  </label>
                  <Select
                    id={`level-${skill.id}`}
                    className="w-44"
                    value={String(selfAssessment[skill.id] ?? 0)}
                    onChange={(event) =>
                      setSelfAssessment((current) => ({
                        ...current,
                        [skill.id]: Number(event.target.value),
                      }))
                    }
                  >
                    {LEVEL_OPTIONS.map((level) => (
                      <option key={level} value={level}>
                        {levelLabel(level)}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            );
          })}
        </fieldset>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field
            label="每周可投入小时（可选）"
            htmlFor="weekly-hours"
            hint="不填则不生成周次承诺。"
          >
            <TextInput
              id="weekly-hours"
              type="number"
              min={1}
              max={80}
              value={weeklyHours}
              onChange={(event) => setWeeklyHours(event.target.value)}
              placeholder="例如 8"
            />
          </Field>
          <Field
            label="计划周期（周，可选）"
            htmlFor="planned-weeks"
            hint="用于检查工时是否超出预算。"
          >
            <TextInput
              id="planned-weeks"
              type="number"
              min={1}
              max={104}
              value={plannedWeeks}
              onChange={(event) => setPlannedWeeks(event.target.value)}
              placeholder="例如 8"
            />
          </Field>
        </div>

        <Button className="mt-5 w-full" onClick={generate}>
          生成成长计划
        </Button>
        <p className="mt-3 text-xs leading-5 text-ink-500">
          生成结果是确定性的：相同目标、自评与时间预算会得到相同任务顺序。平台不调用外部 AI API。
        </p>
      </section>

      <section aria-labelledby="plan-heading">
        <SectionHeading id="plan-heading" eyebrow="第 2 步" title="计划与验收标准" />
        {plan === null ? (
          <div className="rounded-2xl border border-dashed border-line-strong bg-surface/70 p-8 text-center">
            <p className="text-sm font-semibold text-ink-900">填写左侧自评后生成计划</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">
              结果会在这里显示技能缺口、阶段顺序、任务产出、验收标准、时间估算与 Markdown 导出。
            </p>
          </div>
        ) : plan.ok === false ? (
          <Alert tone="danger" title="无法生成计划">
            {plan.message}
            {plan.path ? <p className="mt-2 font-mono text-xs">{plan.path.join(' → ')}</p> : null}
          </Alert>
        ) : (
          <PlanResult
            plan={plan}
            onCopy={copyMarkdown}
            onDownload={downloadMarkdown}
            copyStatus={copyStatus}
          />
        )}
      </section>
    </div>
  );
}

function PlanResult({
  plan,
  onCopy,
  onDownload,
  copyStatus,
}: {
  plan: GrowthPlan;
  onCopy: (plan: GrowthPlan) => void;
  onDownload: (plan: GrowthPlan) => void;
  copyStatus: string;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-ink-900">{plan.targetName}</h3>
            <p className="mt-1 text-xs text-ink-500">
              待学习 {plan.skills.length} 个技能 · 已满足 {plan.satisfied.length} 个 · 已知工时{' '}
              {formatHours(plan.totalKnownHours)}
              {plan.requiredWeeks ? ` · 至少 ${plan.requiredWeeks} 周` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => onCopy(plan)}>
              复制 Markdown
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onDownload(plan)}>
              下载 Markdown
            </Button>
          </div>
        </div>
        {copyStatus ? (
          <p role="status" className="mt-2 text-xs text-brand-700">
            {copyStatus}
          </p>
        ) : null}
        <ul className="mt-3 space-y-1.5 border-t border-line pt-3 text-xs leading-5 text-ink-500">
          {plan.warnings.map((warning) => (
            <li key={warning}>· {warning}</li>
          ))}
        </ul>
      </div>

      {plan.skills.length === 0 ? (
        <Alert tone="success" title="目标技能已全部满足自评目标">
          当前没有需要新增的学习任务。自评仍不是验证证据；建议用项目产出或测试记录校正。
        </Alert>
      ) : (
        plan.phases.map((phase) => (
          <div key={phase.phase} className="space-y-3">
            <h3 className="text-sm font-bold tracking-wide text-ink-500 uppercase">
              阶段 {phase.phase}
            </h3>
            {phase.skillIds.map((skillId) => {
              const skill = plan.skills.find((item) => item.skillId === skillId);
              if (!skill) return null;
              return (
                <article key={skillId} className="rounded-2xl border border-line bg-surface p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-ink-900">{skill.skillName}</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="brand">
                        {levelLabel(skill.currentLevel)} → {levelLabel(skill.targetLevel)}
                      </Badge>
                      {skill.weekStart && skill.weekEnd ? (
                        <Badge tone="neutral">
                          第 {skill.weekStart}
                          {skill.weekEnd !== skill.weekStart ? `–${skill.weekEnd}` : ''} 周
                        </Badge>
                      ) : (
                        <Badge tone="warning">周次待工时</Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-3">
                    {skill.practiceTasks.map((task) => (
                      <div key={task.id} className="rounded-xl border border-line p-3">
                        <h5 className="text-sm font-semibold text-ink-900">{task.title}</h5>
                        <p className="mt-1 text-xs leading-5 text-ink-500">{task.goal}</p>
                        <p className="mt-2 text-xs font-semibold text-ink-700">验收标准</p>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-xs leading-5 text-ink-700">
                          {task.acceptance_criteria.map((criterion) => (
                            <li key={criterion}>{criterion}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 border-t border-line pt-3">
                    <p className="text-xs font-semibold text-ink-700">参考资源</p>
                    {skill.resources.length > 0 ? (
                      <ul className="mt-1 space-y-1">
                        {skill.resources.map((resource) => (
                          <li key={resource.id} className="text-xs">
                            <ExternalLink href={resource.url}>{resource.title}</ExternalLink>
                            <span className="ml-1 text-ink-500">（{resource.free_status}）</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-xs text-ink-500">待补充（平台不会生成虚构链接）。</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ))
      )}

      <div className="rounded-2xl border border-line bg-surface-muted p-5">
        <h3 className="text-sm font-bold text-ink-900">前提与限制</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-ink-700">
          {plan.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-5 text-ink-500">
          平台不承诺获奖、保研或就业结果；计划中的工时与阶段是估算。导出内容包含本说明与风险提示。
        </p>
      </div>
    </div>
  );
}
