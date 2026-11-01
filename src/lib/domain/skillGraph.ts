import type { Skill } from './types';

export interface SkillGraphResult {
  order: string[];
  cycle: string[] | null;
  missing: string[];
}

export function buildSkillMap(skills: Skill[]): Map<string, Skill> {
  return new Map(skills.map((skill) => [skill.id, skill]));
}

export function findSkillCycle(skills: Skill[]): string[] | null {
  const map = buildSkillMap(skills);
  const state = new Map<string, 0 | 1 | 2>();
  const stack: string[] = [];

  const visit = (id: string): string[] | null => {
    const current = state.get(id) ?? 0;
    if (current === 1) {
      const start = stack.indexOf(id);
      return [...stack.slice(start), id];
    }
    if (current === 2) return null;

    state.set(id, 1);
    stack.push(id);
    const skill = map.get(id);
    if (skill) {
      for (const prerequisite of [...skill.prerequisite_skill_ids].sort()) {
        const cycle = visit(prerequisite);
        if (cycle) return cycle;
      }
    }
    stack.pop();
    state.set(id, 2);
    return null;
  };

  for (const id of [...map.keys()].sort()) {
    const cycle = visit(id);
    if (cycle) return cycle;
  }

  return null;
}

export function missingPrerequisites(skills: Skill[]): Array<{ skill: string; missing: string[] }> {
  const map = buildSkillMap(skills);
  return skills
    .map((skill) => ({
      skill: skill.id,
      missing: skill.prerequisite_skill_ids.filter((id) => !map.has(id)),
    }))
    .filter((entry) => entry.missing.length > 0);
}

export function collectPrerequisites(targetIds: string[], skills: Skill[]): string[] {
  const map = buildSkillMap(skills);
  const collected = new Set<string>();
  const queue = [...targetIds];

  while (queue.length > 0) {
    const id = queue.shift();
    if (!id || collected.has(id)) continue;
    collected.add(id);
    const skill = map.get(id);
    if (skill) queue.push(...skill.prerequisite_skill_ids);
  }

  return [...collected].sort();
}

/**
 * Kahn 拓扑排序，输入子集；缺失的前置技能会进入 missing 而不被静默忽略。
 * 若存在环，order 仅包含可排序部分，并返回环路径。
 */
export function topologicalSortSkills(targetIds: string[], skills: Skill[]): SkillGraphResult {
  const map = buildSkillMap(skills);
  const included = new Set<string>();
  const missing = new Set<string>();
  const queue = [...targetIds];

  while (queue.length > 0) {
    const id = queue.shift();
    if (!id) continue;
    if (!map.has(id)) {
      missing.add(id);
      continue;
    }
    if (included.has(id)) continue;
    included.add(id);
    queue.push(...(map.get(id)?.prerequisite_skill_ids ?? []));
  }

  const indegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const id of included) {
    indegree.set(id, 0);
  }

  for (const id of included) {
    const skill = map.get(id);
    if (!skill) continue;
    for (const prerequisite of skill.prerequisite_skill_ids) {
      if (!included.has(prerequisite)) continue;
      indegree.set(id, (indegree.get(id) ?? 0) + 1);
      const list = dependents.get(prerequisite) ?? [];
      list.push(id);
      dependents.set(prerequisite, list);
    }
  }

  const ready = [...included].filter((id) => (indegree.get(id) ?? 0) === 0).sort();
  const order: string[] = [];

  while (ready.length > 0) {
    const id = ready.shift();
    if (!id) break;
    order.push(id);
    for (const dependent of (dependents.get(id) ?? []).sort()) {
      const next = (indegree.get(dependent) ?? 0) - 1;
      indegree.set(dependent, next);
      if (next === 0) {
        ready.push(dependent);
        ready.sort();
      }
    }
  }

  const cycle = order.length === included.size ? null : findSkillCycle(skills);

  return {
    order,
    cycle,
    missing: [...missing].sort(),
  };
}

export function dependencyDepth(
  id: string,
  map: Map<string, Skill>,
  memo = new Map<string, number>(),
  visiting = new Set<string>(),
): number {
  const cached = memo.get(id);
  if (cached !== undefined) return cached;
  if (visiting.has(id)) return 0;
  visiting.add(id);
  const skill = map.get(id);
  if (!skill || skill.prerequisite_skill_ids.length === 0) {
    memo.set(id, 1);
    visiting.delete(id);
    return 1;
  }
  const depth =
    1 +
    Math.max(
      ...skill.prerequisite_skill_ids.map((prerequisite) =>
        dependencyDepth(prerequisite, map, memo, visiting),
      ),
    );
  memo.set(id, depth);
  visiting.delete(id);
  return depth;
}
