import {
  buildSkillMap,
  dependencyDepth,
  findSkillCycle,
  topologicalSortSkills,
} from './skillGraph';
import type { PracticeTask, Resource, Skill } from './types';

export interface TargetSkill {
  skillId: string;
  targetLevel: number;
}

export interface PlannerInput {
  targetName: string;
  targetSkills: TargetSkill[];
  selfAssessment: Record<string, number>;
  skills: Skill[];
  resources: Resource[];
  weeklyHours?: number | null;
  plannedWeeks?: number | null;
}

export interface PlanSkill {
  skillId: string;
  skillName: string;
  domain: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  phase: number;
  practiceTasks: PracticeTask[];
  resources: Resource[];
  weekStart: number | null;
  weekEnd: number | null;
}

export interface GrowthPlan {
  ok: true;
  targetName: string;
  phases: Array<{ phase: number; skillIds: string[] }>;
  skills: PlanSkill[];
  satisfied: Array<{ skillId: string; skillName: string; level: number }>;
  warnings: string[];
  assumptions: string[];
  totalKnownHours: number;
  unknownHours: boolean;
  weeklyHours: number | null;
  plannedWeeks: number | null;
  requiredWeeks: number | null;
}

export interface GrowthPlanError {
  ok: false;
  code: 'cycle' | 'missing_skill' | 'empty_target';
  message: string;
  path?: string[];
}

export type GrowthPlanResult = GrowthPlan | GrowthPlanError;

const MAX_PREREQUISITE_LEVEL = 2;
const MAX_TASKS_PER_SKILL = 2;

function clampLevel(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(4, Math.max(0, Math.round(value)));
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

export function buildGrowthPlan(input: PlannerInput): GrowthPlanResult {
  if (input.targetSkills.length === 0) {
    return {
      ok: false,
      code: 'empty_target',
      message: '该目标没有配置目标技能，暂时无法生成学习路线。',
    };
  }

  const map = buildSkillMap(input.skills);
  const desired = new Map<string, number>();
  const missing = new Set<string>();
  const queue: TargetSkill[] = input.targetSkills.map((item) => ({
    skillId: item.skillId,
    targetLevel: clampLevel(item.targetLevel),
  }));

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    const skill = map.get(current.skillId);
    if (!skill) {
      missing.add(current.skillId);
      continue;
    }
    const previous = desired.get(current.skillId) ?? -1;
    if (current.targetLevel <= previous) continue;
    desired.set(current.skillId, current.targetLevel);

    for (const prerequisite of skill.prerequisite_skill_ids) {
      queue.push({
        skillId: prerequisite,
        targetLevel: Math.min(MAX_PREREQUISITE_LEVEL, current.targetLevel),
      });
    }
  }

  if (missing.size > 0) {
    return {
      ok: false,
      code: 'missing_skill',
      message: `目标引用了不存在的技能：${[...missing].sort().join('、')}`,
    };
  }

  const cycle = findSkillCycle(input.skills);
  if (cycle) {
    return {
      ok: false,
      code: 'cycle',
      message: `技能依赖存在循环：${cycle.join(' → ')}`,
      path: cycle,
    };
  }

  const plannedIds = [...desired.keys()].filter((id) => {
    const current = clampLevel(input.selfAssessment[id] ?? 0);
    return current < (desired.get(id) ?? 0);
  });

  const satisfied = [...desired.entries()]
    .filter(([id, target]) => clampLevel(input.selfAssessment[id] ?? 0) >= target)
    .map(([id]) => ({
      skillId: id,
      skillName: map.get(id)?.name ?? id,
      level: clampLevel(input.selfAssessment[id] ?? 0),
    }))
    .sort((a, b) => a.skillId.localeCompare(b.skillId));

  const graph = topologicalSortSkills(plannedIds, input.skills);
  if (graph.cycle) {
    return {
      ok: false,
      code: 'cycle',
      message: `技能依赖存在循环：${graph.cycle.join(' → ')}`,
      path: graph.cycle,
    };
  }

  const plannedSet = new Set(plannedIds);
  const orderedIds = graph.order.filter((id) => plannedSet.has(id));

  const depths = new Map<string, number>();
  for (const id of orderedIds) {
    const skill = map.get(id);
    const prerequisites = (skill?.prerequisite_skill_ids ?? []).filter((item) =>
      plannedSet.has(item),
    );
    const depth =
      prerequisites.length === 0
        ? 1
        : 1 + Math.max(...prerequisites.map((item) => depths.get(item) ?? 1));
    depths.set(id, depth);
  }

  const warnings = new Set<string>();
  warnings.add('当前技能等级来自你的自评，不代表已验证能力或项目证据。');

  const weeklyHours =
    typeof input.weeklyHours === 'number' && input.weeklyHours > 0 ? input.weeklyHours : null;
  const plannedWeeks =
    typeof input.plannedWeeks === 'number' && input.plannedWeeks > 0 ? input.plannedWeeks : null;

  if (!weeklyHours) {
    warnings.add('未提供每周可投入时间，计划只给出阶段顺序，不承诺具体日期。');
  }

  const resourceMap = new Map(input.resources.map((resource) => [resource.id, resource]));
  const missingResourceSkills: string[] = [];
  let unknownHours = false;
  let totalKnownHours = 0;

  const skills: PlanSkill[] = orderedIds.map((id) => {
    const skill = map.get(id);
    if (!skill) throw new Error(`技能 ${id} 不存在`);
    const currentLevel = clampLevel(input.selfAssessment[id] ?? 0);
    const targetLevel = desired.get(id) ?? 0;
    const levelTasks = skill.practice_tasks.filter(
      (task) => task.level >= currentLevel && task.level <= targetLevel,
    );
    const fallbackTasks = skill.practice_tasks.filter((task) => task.level <= targetLevel);
    const practiceTasks = (
      levelTasks.length > 0
        ? levelTasks
        : fallbackTasks.length > 0
          ? fallbackTasks
          : skill.practice_tasks
    ).slice(0, MAX_TASKS_PER_SKILL);

    const resources = uniqueSorted(skill.resource_ids)
      .map((resourceId) => resourceMap.get(resourceId))
      .filter((resource): resource is Resource => resource !== undefined);

    if (resources.length === 0) {
      missingResourceSkills.push(skill.name);
    }

    const knownHours = practiceTasks
      .map((task) => task.estimated_hours)
      .filter((value): value is number => value !== null);

    if (knownHours.length !== practiceTasks.length) {
      unknownHours = true;
    }
    totalKnownHours += knownHours.reduce((sum, value) => sum + value, 0);

    return {
      skillId: id,
      skillName: skill.name,
      domain: skill.domain,
      currentLevel,
      targetLevel,
      gap: Math.max(0, targetLevel - currentLevel),
      phase: depths.get(id) ?? 1,
      practiceTasks: [...practiceTasks],
      resources,
      weekStart: null,
      weekEnd: null,
    };
  });

  if (weeklyHours && !unknownHours) {
    let cursor = 0;
    for (const skill of skills) {
      const skillHours = skill.practiceTasks
        .map((task) => task.estimated_hours)
        .filter((value): value is number => value !== null)
        .reduce((sum, value) => sum + value, 0);
      if (skillHours > 0) {
        skill.weekStart = Math.floor(cursor / weeklyHours) + 1;
        skill.weekEnd = Math.max(skill.weekStart, Math.ceil((cursor + skillHours) / weeklyHours));
        cursor += skillHours;
      }
    }
  }

  if (missingResourceSkills.length > 0) {
    warnings.add(
      `以下技能暂无可靠学习资源，计划中标注为“待补充”：${missingResourceSkills.join('、')}`,
    );
  }

  if (unknownHours) {
    warnings.add('部分任务没有可靠工时估计，计划不生成周次，也不承诺完成日期。');
  }

  const requiredWeeks =
    weeklyHours && !unknownHours && totalKnownHours > 0
      ? Math.ceil(totalKnownHours / weeklyHours)
      : null;

  if (plannedWeeks && requiredWeeks && requiredWeeks > plannedWeeks) {
    warnings.add(
      `按每周 ${weeklyHours} 小时计算至少需要 ${requiredWeeks} 周，超过你填写的 ${plannedWeeks} 周。`,
    );
  }

  const phaseNumbers = uniqueSorted(skills.map((skill) => String(skill.phase))).map(Number);
  const phases = phaseNumbers.map((phase) => ({
    phase,
    skillIds: skills.filter((skill) => skill.phase === phase).map((skill) => skill.skillId),
  }));

  return {
    ok: true,
    targetName: input.targetName,
    phases,
    skills,
    satisfied,
    warnings: [...warnings],
    assumptions: [
      '目标技能等级来自平台技能图谱与目标竞赛配置。',
      '当前等级完全来自用户自评，未与项目证据或导师评价绑定。',
      '工时是任务级估算，不是对完成日期的承诺。',
      '未提供可靠资源的技能不会生成虚构链接。',
    ],
    totalKnownHours,
    unknownHours,
    weeklyHours,
    plannedWeeks,
    requiredWeeks,
  };
}

function levelLabel(level: number): string {
  return `L${level}`;
}

export function planToMarkdown(plan: GrowthPlan): string {
  const lines: string[] = [];
  lines.push(`# ${plan.targetName}：成长计划`);
  lines.push('');
  lines.push(
    '> 本计划由 TechCompetitionHub 的确定性规则引擎生成。当前技能等级来自你的自评，不是已验证能力；平台不承诺获奖、保研或就业结果。',
  );
  lines.push('');

  lines.push('## 计划概览');
  lines.push('');
  lines.push(`- 目标技能数（含前置）：${plan.skills.length + plan.satisfied.length}`);
  lines.push(`- 待学习技能：${plan.skills.length}`);
  lines.push(
    `- 已满足自评目标：${plan.satisfied.length}${plan.satisfied.length > 0 ? `（${plan.satisfied.map((item) => `${item.skillName} ${levelLabel(item.level)}`).join('、')}）` : ''}`,
  );
  lines.push(
    `- 已知工时合计：${plan.totalKnownHours > 0 ? `${plan.totalKnownHours} 小时` : '暂无可靠估算'}`,
  );
  lines.push(
    `- 时间预算：${plan.weeklyHours ? `每周 ${plan.weeklyHours} 小时` : '未提供'}${plan.plannedWeeks ? `，计划 ${plan.plannedWeeks} 周` : ''}`,
  );
  if (plan.requiredWeeks) {
    lines.push(`- 按工时估算至少需要：${plan.requiredWeeks} 周`);
  }
  lines.push('');

  lines.push('## 技能差距');
  lines.push('');
  lines.push('| 技能 | 当前自评 | 目标 | 缺口 | 阶段 | 周次 |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  for (const skill of plan.skills) {
    const weeks =
      skill.weekStart && skill.weekEnd
        ? skill.weekStart === skill.weekEnd
          ? `第 ${skill.weekStart} 周`
          : `第 ${skill.weekStart}–${skill.weekEnd} 周`
        : '待补充工时';
    lines.push(
      `| ${skill.skillName} | ${levelLabel(skill.currentLevel)} | ${levelLabel(skill.targetLevel)} | ${skill.gap} | ${skill.phase} | ${weeks} |`,
    );
  }
  lines.push('');

  for (const phase of plan.phases) {
    lines.push(`## 阶段 ${phase.phase}`);
    lines.push('');
    for (const skillId of phase.skillIds) {
      const skill = plan.skills.find((item) => item.skillId === skillId);
      if (!skill) continue;
      lines.push(
        `### ${skill.skillName}（${levelLabel(skill.currentLevel)} → ${levelLabel(skill.targetLevel)}）`,
      );
      lines.push('');
      for (const task of skill.practiceTasks) {
        lines.push(
          `- [ ] **${task.title}**${task.estimated_hours ? `（约 ${task.estimated_hours} 小时）` : '（工时待补充）'}`,
        );
        lines.push(`  - 目标：${task.goal}`);
        lines.push('  - 产出：');
        for (const deliverable of task.deliverables) lines.push(`    - ${deliverable}`);
        lines.push('  - 验收标准：');
        for (const criterion of task.acceptance_criteria) lines.push(`    - ${criterion}`);
      }
      if (skill.resources.length > 0) {
        lines.push('  - 参考资源：');
        for (const resource of skill.resources) {
          lines.push(
            `    - [${resource.title}](${resource.url})（${resource.free_status}，最后检查：${resource.last_checked_at}）`,
          );
        }
      } else {
        lines.push('  - 参考资源：待补充（平台不会生成虚构链接）');
      }
      lines.push('');
    }
  }

  lines.push('## 前提与限制');
  lines.push('');
  for (const assumption of plan.assumptions) lines.push(`- ${assumption}`);
  for (const warning of plan.warnings) lines.push(`- ${warning}`);
  lines.push('');
  lines.push('## 风险提示');
  lines.push('');
  lines.push('- 计划中的工时与阶段是估算，实际进度取决于基础、设备与投入时间。');
  lines.push('- 自评等级可能高于或低于实际能力；请用可复现的项目产出校正。');
  lines.push('- 竞赛报名时间、费用与规则以官方来源为准，请在使用前再次核验。');
  lines.push('');

  return lines.join('\n');
}

export { dependencyDepth };
