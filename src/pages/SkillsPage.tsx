import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Button, ButtonLink } from '../components/Button';
import { Field, Select, TextInput } from '../components/Fields';
import { Container, PageHeader } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { EmptyState } from '../components/States';
import { getSkillDomainLabel, getSkillDomainOptions, listSkills } from '../services/skillService';

export function SkillsPage() {
  usePageMeta({
    title: '技能图谱',
    description:
      '按行为描述定义 L0–L4 技能等级，展示前置技能、可验证练习任务与真实学习资源。技能等级是规划框架，不是认证。',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const domain = searchParams.get('domain') ?? '';
  const [query, setQuery] = useState('');
  const skills = listSkills();
  const domains = getSkillDomainOptions();

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('zh-CN');
    return skills.filter((skill) => {
      if (domain && skill.domain !== domain) return false;
      if (!normalized) return true;
      const haystack = `${skill.name} ${skill.definition} ${skill.id}`.toLocaleLowerCase('zh-CN');
      return haystack.includes(normalized);
    });
  }, [skills, domain, query]);

  return (
    <>
      <PageHeader
        eyebrow="技能图谱"
        title="把“会一点”拆成可验证的行为"
        description="每个技能有 L0–L4 行为描述、前置依赖和至少一个有验收标准的练习任务。等级用于规划，不是认证；自评不自动等于已验证能力。"
        meta={
          <p className="text-sm text-ink-500">
            共 {skills.length} 个技能，覆盖 {domains.length} 个领域。
          </p>
        }
        actions={
          <ButtonLink to="/planner" variant="secondary">
            用技能图谱做规划
          </ButtonLink>
        }
      />

      <Container className="py-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:flex-row sm:items-end">
          <Field label="搜索技能" htmlFor="skill-q" className="flex-1">
            <TextInput
              id="skill-q"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="例如：嵌入式、统计、逆向"
            />
          </Field>
          <Field label="领域" htmlFor="skill-domain" className="sm:w-64">
            <Select
              id="skill-domain"
              value={domain}
              onChange={(event) => {
                const value = event.target.value;
                setSearchParams(value ? { domain: value } : {}, { replace: true });
              }}
            >
              <option value="">全部领域</option>
              {domains.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}（{item.count}）
                </option>
              ))}
            </Select>
          </Field>
          {domain || query ? (
            <Button
              variant="ghost"
              onClick={() => {
                setQuery('');
                setSearchParams({}, { replace: true });
              }}
            >
              清除
            </Button>
          ) : null}
        </div>

        <p aria-live="polite" className="mt-5 text-sm text-ink-700">
          找到 <strong>{results.length}</strong> 个技能
        </p>

        <h2 className="sr-only">技能列表</h2>
        {results.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((skill) => (
              <article
                key={skill.id}
                className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition-colors hover:border-brand-500/60"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{getSkillDomainLabel(skill.domain)}</Badge>
                  {skill.prerequisite_skill_ids.length > 0 ? (
                    <Badge tone="neutral">前置 {skill.prerequisite_skill_ids.length}</Badge>
                  ) : (
                    <Badge tone="success">无前置</Badge>
                  )}
                </div>
                <h2 className="mt-3 text-lg font-bold text-ink-900">
                  <Link to={`/skills/${skill.id}`} className="hover:text-brand-700">
                    {skill.name}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-ink-500">
                  {skill.definition}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-ink-500">
                  <span>{skill.practice_tasks.length} 个练习任务</span>
                  <span>{skill.related_competition_ids.length} 个关联竞赛</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="没有匹配的技能"
              description="尝试更短的关键词或清除领域筛选。技能条目由维护者按贡献指南审核，不使用自动生成的占位内容。"
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery('');
                    setSearchParams({}, { replace: true });
                  }}
                >
                  清除筛选
                </Button>
              }
            />
          </div>
        )}
      </Container>
    </>
  );
}
