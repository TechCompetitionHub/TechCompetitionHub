import { describe, expect, it } from 'vitest';
import {
  buildGrowthPlan,
  planToMarkdown,
  type GrowthPlan,
  type GrowthPlanResult,
} from '../../src/lib/domain/roadmap';
import { skillSchema, type Skill } from '../../src/lib/domain/schemas';
import { dataset } from '../../src/services/dataSource';
import mathJson from '../../data/skills/math-foundations.json';

const targetSkills = [
  { skillId: 'mathematical-modeling', targetLevel: 2 },
  { skillId: 'technical-writing', targetLevel: 2 },
];

function expectPlan(result: GrowthPlanResult): GrowthPlan {
  if (!result.ok) throw new Error(`预期成功，实际失败：${result.message}`);
  return result;
}

function cloneSkill(id: string, mutate: (skill: Skill) => void): Skill {
  const base = skillSchema.parse(mathJson);
  const copy = structuredClone(base);
  copy.id = id;
  copy.name = `测试技能 ${id}`;
  mutate(copy);
  return skillSchema.parse(copy);
}

describe('成长规划器', () => {
  it('按依赖顺序生成阶段与任务，并提供验收标准', () => {
    const plan = expectPlan(
      buildGrowthPlan({
        targetName: '数学建模目标',
        targetSkills,
        selfAssessment: {},
        skills: dataset.skills,
        resources: dataset.resources,
        weeklyHours: 8,
      }),
    );

    const order = plan.skills.map((skill) => skill.skillId);
    expect(order.indexOf('math-foundations')).toBeLessThan(order.indexOf('statistics'));
    expect(order.indexOf('statistics')).toBeLessThan(order.indexOf('mathematical-modeling'));
    expect(order.indexOf('python-programming')).toBeLessThan(
      order.indexOf('mathematical-modeling'),
    );
    expect(plan.skills.some((skill) => skill.resources.length === 0)).toBe(true);
    expect(plan.warnings.join(' ')).toContain('待补充');
    expect(plan.totalKnownHours).toBeGreaterThan(0);
    expect(plan.requiredWeeks).toBeGreaterThan(0);
    for (const skill of plan.skills) {
      expect(skill.practiceTasks.length).toBeGreaterThan(0);
      for (const task of skill.practiceTasks) {
        expect(task.acceptance_criteria.length).toBeGreaterThan(0);
      }
    }
  });

  it('未提供时间预算时不生成周次或精确日期', () => {
    const plan = expectPlan(
      buildGrowthPlan({
        targetName: '无时间预算',
        targetSkills,
        selfAssessment: {},
        skills: dataset.skills,
        resources: dataset.resources,
      }),
    );
    expect(plan.weeklyHours).toBeNull();
    expect(plan.requiredWeeks).toBeNull();
    expect(plan.skills.every((skill) => skill.weekStart === null)).toBe(true);
    expect(plan.warnings.join(' ')).toContain('不承诺具体日期');
  });

  it('当前等级高于目标等级时不生成重复任务', () => {
    const plan = expectPlan(
      buildGrowthPlan({
        targetName: '已满足',
        targetSkills,
        selfAssessment: { 'mathematical-modeling': 4, 'technical-writing': 4 },
        skills: dataset.skills,
        resources: dataset.resources,
      }),
    );
    expect(plan.skills.some((skill) => skill.skillId === 'mathematical-modeling')).toBe(false);
    expect(plan.satisfied.map((item) => item.skillId)).toContain('mathematical-modeling');
  });

  it('全部满足时返回空任务与已满足列表', () => {
    const plan = expectPlan(
      buildGrowthPlan({
        targetName: '全部满足',
        targetSkills,
        selfAssessment: {
          'mathematical-modeling': 4,
          'technical-writing': 4,
          statistics: 4,
          'python-programming': 4,
          'math-foundations': 4,
        },
        skills: dataset.skills,
        resources: dataset.resources,
      }),
    );
    expect(plan.skills).toHaveLength(0);
    expect(plan.satisfied.length).toBeGreaterThan(0);
  });

  it('无可靠工时时不生成周次', () => {
    const skills = dataset.skills.map((skill) => {
      if (skill.id !== 'python-programming') return skill;
      const copy = structuredClone(skill);
      copy.practice_tasks[0].estimated_hours = null;
      return skillSchema.parse(copy);
    });
    const plan = expectPlan(
      buildGrowthPlan({
        targetName: '工时未知',
        targetSkills: [{ skillId: 'python-programming', targetLevel: 2 }],
        selfAssessment: {},
        skills,
        resources: dataset.resources,
        weeklyHours: 8,
      }),
    );
    expect(plan.unknownHours).toBe(true);
    expect(plan.requiredWeeks).toBeNull();
    expect(plan.skills.every((skill) => skill.weekStart === null)).toBe(true);
    expect(plan.warnings.join(' ')).toContain('工时估计');
  });

  it('循环依赖返回可读错误', () => {
    const a = cloneSkill('roadmap-cycle-a', (skill) => {
      skill.name = '循环 A';
      skill.prerequisite_skill_ids = ['roadmap-cycle-b'];
    });
    const b = cloneSkill('roadmap-cycle-b', (skill) => {
      skill.name = '循环 B';
      skill.prerequisite_skill_ids = ['roadmap-cycle-a'];
    });
    const result = buildGrowthPlan({
      targetName: '循环目标',
      targetSkills: [{ skillId: 'roadmap-cycle-a', targetLevel: 2 }],
      selfAssessment: {},
      skills: [a, b],
      resources: [],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('cycle');
      expect(result.message).toContain('循环');
      expect(result.path?.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('目标引用不存在技能时返回错误', () => {
    const result = buildGrowthPlan({
      targetName: '缺失目标',
      targetSkills: [{ skillId: 'missing-skill', targetLevel: 2 }],
      selfAssessment: {},
      skills: dataset.skills,
      resources: dataset.resources,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('missing_skill');
  });

  it('Markdown 导出包含免责声明且不含虚构链接', () => {
    const plan = expectPlan(
      buildGrowthPlan({
        targetName: '导出测试',
        targetSkills,
        selfAssessment: {},
        skills: dataset.skills,
        resources: dataset.resources,
        weeklyHours: 6,
        plannedWeeks: 4,
      }),
    );
    const markdown = planToMarkdown(plan);
    expect(markdown).toContain('不承诺获奖、保研或就业结果');
    expect(markdown).toContain('自评');
    expect(markdown).toContain('## 阶段');
    expect(markdown).not.toContain('example.com');
    expect(markdown).not.toContain('localhost');
  });
});
