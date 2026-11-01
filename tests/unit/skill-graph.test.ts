import { describe, expect, it } from 'vitest';
import {
  collectPrerequisites,
  dependencyDepth,
  findSkillCycle,
  missingPrerequisites,
  topologicalSortSkills,
} from '../../src/lib/domain/skillGraph';
import { skillSchema, type Skill } from '../../src/lib/domain/schemas';
import { dataset } from '../../src/services/dataSource';
import mathJson from '../../data/skills/math-foundations.json';

const base = skillSchema.parse(mathJson);

function cloneSkill(id: string, name: string, prerequisites: string[]): Skill {
  const copy = structuredClone(base);
  copy.id = id;
  copy.name = name;
  copy.prerequisite_skill_ids = prerequisites;
  return skillSchema.parse(copy);
}

describe('技能依赖图', () => {
  it('真实数据没有循环依赖或缺失前置', () => {
    expect(findSkillCycle(dataset.skills)).toBeNull();
    expect(missingPrerequisites(dataset.skills)).toEqual([]);
  });

  it('检测两节点循环并返回路径', () => {
    const a = cloneSkill('cycle-a', '循环 A', ['cycle-b']);
    const b = cloneSkill('cycle-b', '循环 B', ['cycle-a']);
    const cycle = findSkillCycle([a, b]);
    expect(cycle).not.toBeNull();
    expect(cycle?.join(' → ')).toBe('cycle-a → cycle-b → cycle-a');
  });

  it('检测自循环', () => {
    const a = cloneSkill('self-cycle', '自循环', ['self-cycle']);
    expect(findSkillCycle([a])?.join(' → ')).toBe('self-cycle → self-cycle');
  });

  it('检测三节点循环', () => {
    const a = cloneSkill('tri-a', '测试 A', ['tri-b']);
    const b = cloneSkill('tri-b', '测试 B', ['tri-c']);
    const c = cloneSkill('tri-c', '测试 C', ['tri-a']);
    expect(findSkillCycle([a, b, c])).not.toBeNull();
  });

  it('拓扑排序保证前置技能先出现', () => {
    const result = topologicalSortSkills(['mathematical-modeling'], dataset.skills);
    expect(result.cycle).toBeNull();
    expect(result.missing).toEqual([]);
    const index = (id: string) => result.order.indexOf(id);
    expect(index('math-foundations')).toBeLessThan(index('statistics'));
    expect(index('statistics')).toBeLessThan(index('mathematical-modeling'));
    expect(index('python-programming')).toBeLessThan(index('mathematical-modeling'));
  });

  it('缺失技能不会被静默忽略', () => {
    const result = topologicalSortSkills(['does-not-exist'], dataset.skills);
    expect(result.missing).toContain('does-not-exist');
  });

  it('展开前置依赖并去重', () => {
    const ids = collectPrerequisites(['mathematical-modeling'], dataset.skills);
    expect(ids).toContain('math-foundations');
    expect(ids).toContain('statistics');
    expect(ids).toContain('python-programming');
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('计算依赖深度', () => {
    const map = new Map(dataset.skills.map((skill) => [skill.id, skill]));
    expect(dependencyDepth('math-foundations', map)).toBe(1);
    expect(dependencyDepth('statistics', map)).toBe(2);
    expect(dependencyDepth('mathematical-modeling', map)).toBeGreaterThanOrEqual(3);
  });
});
