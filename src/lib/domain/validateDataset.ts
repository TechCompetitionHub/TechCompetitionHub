import { validateScoringModel } from './scoring';
import { findSkillCycle, missingPrerequisites } from './skillGraph';
import type { ContentEntry, DataBundle } from './types';

export type Severity = 'error' | 'warning';

export interface ValidationIssue {
  severity: Severity;
  code: string;
  path: string;
  message: string;
}

export interface ValidationOptions {
  asOf?: string;
  staleAfterDays?: number;
}

const DEFAULT_STALE_DAYS = 365;

function daysBetween(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00.000Z`);
  const end = Date.parse(`${to}T00:00:00.000Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.floor((end - start) / 86_400_000);
}

function duplicateIds<T extends { id: string }>(
  records: T[],
  collection: string,
  issues: ValidationIssue[],
): void {
  const seen = new Set<string>();
  for (const record of records) {
    if (seen.has(record.id)) {
      issues.push({
        severity: 'error',
        code: 'duplicate_id',
        path: `${collection}/${record.id}`,
        message: `重复 ID：${record.id}`,
      });
    }
    seen.add(record.id);
  }
}

function checkDate(
  value: string | null,
  path: string,
  asOf: string,
  issues: ValidationIssue[],
  severity: Severity = 'error',
): void {
  if (!value || value <= asOf) return;
  issues.push({
    severity,
    code: 'future_date',
    path,
    message: `日期 ${value} 晚于校验基准日 ${asOf}`,
  });
}

function validateSources(
  sources: Array<{ id: string; url: string; source_type: string }>,
  path: string,
  issues: ValidationIssue[],
): void {
  const ids = new Set<string>();
  const urls = new Set<string>();
  for (const source of sources) {
    if (ids.has(source.id)) {
      issues.push({
        severity: 'error',
        code: 'duplicate_source_id',
        path,
        message: `来源 ID 重复：${source.id}`,
      });
    }
    ids.add(source.id);
    if (urls.has(source.url)) {
      issues.push({
        severity: 'warning',
        code: 'duplicate_source_url',
        path,
        message: `来源 URL 重复：${source.url}`,
      });
    }
    urls.add(source.url);
  }
}

function hasAuthoritativeSource(sources: Array<{ source_type: string }>): boolean {
  return sources.some((source) =>
    ['official', 'organizer', 'institutional'].includes(source.source_type),
  );
}

export function validateDataset(
  bundle: DataBundle,
  contents: ContentEntry[],
  options: ValidationOptions = {},
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const asOf = options.asOf ?? new Date().toISOString().slice(0, 10);
  const staleDays = options.staleAfterDays ?? DEFAULT_STALE_DAYS;

  const vocabularyTerms = (id: string) =>
    new Set(
      bundle.vocabularies
        .find((vocabulary) => vocabulary.id === id)
        ?.terms.map((term) => term.id) ?? [],
    );

  const domainIds = vocabularyTerms('domains');
  const audienceIds = vocabularyTerms('audience-levels');
  const skillDomainIds = vocabularyTerms('skill-domains');

  const competitionMap = new Map(
    bundle.competitions.map((competition) => [competition.id, competition]),
  );
  const skillMap = new Map(bundle.skills.map((skill) => [skill.id, skill]));
  const projectMap = new Map(bundle.projects.map((project) => [project.id, project]));
  const resourceMap = new Map(bundle.resources.map((resource) => [resource.id, resource]));
  const modelMap = new Map(
    bundle.scoringModels.map((model) => [`${model.id}@${model.version}`, model]),
  );

  duplicateIds(bundle.competitions, 'competitions', issues);
  duplicateIds(bundle.skills, 'skills', issues);
  duplicateIds(bundle.projects, 'projects', issues);
  duplicateIds(bundle.resources, 'resources', issues);
  duplicateIds(bundle.roadmaps, 'roadmaps', issues);
  duplicateIds(bundle.reviews, 'reviews', issues);
  duplicateIds(bundle.companies, 'companies', issues);

  for (const vocabulary of bundle.vocabularies) {
    const termIds = new Set<string>();
    for (const term of vocabulary.terms) {
      if (termIds.has(term.id)) {
        issues.push({
          severity: 'error',
          code: 'duplicate_vocabulary_term',
          path: `vocabularies/${vocabulary.id}`,
          message: `词表 ${vocabulary.id} 中重复词项：${term.id}`,
        });
      }
      termIds.add(term.id);
    }
  }

  for (const model of bundle.scoringModels) {
    for (const message of validateScoringModel(model)) {
      issues.push({
        severity: 'error',
        code: 'invalid_scoring_model',
        path: `scoring-models/${model.id}@${model.version}`,
        message,
      });
    }
    checkDate(model.effective_from, `scoring-models/${model.id}`, asOf, issues);
  }

  for (const competition of bundle.competitions) {
    const path = `competitions/${competition.id}`;

    if (competition.is_example && competition.verification_status === 'verified') {
      issues.push({
        severity: 'error',
        code: 'example_verified',
        path,
        message: '示例数据不得标记为 verified',
      });
    }

    for (const domain of competition.domains) {
      if (domainIds.size > 0 && !domainIds.has(domain)) {
        issues.push({
          severity: 'error',
          code: 'unknown_domain',
          path,
          message: `领域不在受控词表中：${domain}`,
        });
      }
    }

    for (const audience of competition.audience.levels) {
      if (audienceIds.size > 0 && !audienceIds.has(audience)) {
        issues.push({
          severity: 'error',
          code: 'unknown_audience',
          path,
          message: `适合对象不在受控词表中：${audience}`,
        });
      }
    }

    const requirementIds = competition.skills_required.map((item) => item.skill_id);
    if (new Set(requirementIds).size !== requirementIds.length) {
      issues.push({
        severity: 'error',
        code: 'duplicate_skill_requirement',
        path,
        message: 'skills_required 中存在重复技能 ID',
      });
    }

    for (const requirement of competition.skills_required) {
      if (!skillMap.has(requirement.skill_id)) {
        issues.push({
          severity: 'error',
          code: 'missing_skill_reference',
          path,
          message: `引用了不存在的技能：${requirement.skill_id}`,
        });
      }
    }

    validateSources(competition.sources, path, issues);

    const listIds = new Set<string>();
    const asOfYear = Number(asOf.slice(0, 4));
    for (const list of competition.external_lists) {
      if (listIds.has(list.id)) {
        issues.push({
          severity: 'error',
          code: 'duplicate_external_list',
          path,
          message: `外部目录引用 ID 重复：${list.id}`,
        });
      }
      listIds.add(list.id);
      if (Number.isFinite(asOfYear) && list.year > asOfYear) {
        issues.push({
          severity: 'warning',
          code: 'future_external_list',
          path,
          message: `外部目录年份 ${list.year} 晚于校验基准日`,
        });
      }
    }

    if (competition.verification_status === 'verified') {
      if (!competition.last_verified_at) {
        issues.push({
          severity: 'error',
          code: 'verified_without_date',
          path,
          message: 'verified 条目必须填写 last_verified_at',
        });
      }
      if (!hasAuthoritativeSource(competition.sources)) {
        issues.push({
          severity: 'error',
          code: 'verified_without_authority',
          path,
          message: 'verified 条目至少需要一个 official/organizer/institutional 来源',
        });
      }
    }

    if (competition.last_verified_at && competition.verification_status === 'verified') {
      const age = daysBetween(competition.last_verified_at, asOf);
      if (age > staleDays) {
        issues.push({
          severity: 'warning',
          code: 'stale_verification',
          path,
          message: `最后核验已过去 ${age} 天，建议复核或标记为 stale`,
        });
      }
    }

    if (competition.updated_at < competition.created_at) {
      issues.push({
        severity: 'error',
        code: 'invalid_date_order',
        path,
        message: 'updated_at 早于 created_at',
      });
    }

    checkDate(competition.created_at, path, asOf, issues, 'warning');
    checkDate(competition.updated_at, path, asOf, issues, 'warning');
    checkDate(competition.last_verified_at, path, asOf, issues);

    const scheduleDates = [
      competition.schedule.registration_start,
      competition.schedule.registration_end,
      competition.schedule.event_start,
      competition.schedule.event_end,
    ].filter((value): value is string => value !== null);

    if (competition.schedule.status === 'confirmed' && scheduleDates.length === 0) {
      issues.push({
        severity: 'error',
        code: 'confirmed_schedule_without_dates',
        path,
        message: 'schedule.status 为 confirmed 但没有日期',
      });
    }

    if (
      competition.schedule.registration_start &&
      competition.schedule.registration_end &&
      competition.schedule.registration_start > competition.schedule.registration_end
    ) {
      issues.push({
        severity: 'error',
        code: 'invalid_schedule_order',
        path,
        message: '报名开始日期晚于报名结束日期',
      });
    }

    if (
      competition.estimated_cost.status === 'verified' &&
      competition.estimated_cost.amount === null
    ) {
      issues.push({
        severity: 'error',
        code: 'verified_cost_without_amount',
        path,
        message: '费用状态为 verified 时必须提供金额',
      });
    }

    if (!competition.scores) {
      if (competition.scoring_model_version) {
        issues.push({
          severity: 'warning',
          code: 'model_without_scores',
          path,
          message: '声明了评分模型版本但没有评分',
        });
      }
      continue;
    }

    const model = modelMap.get(`competition-value@${competition.scores.model_version}`);
    if (!model) {
      issues.push({
        severity: 'error',
        code: 'unknown_scoring_model',
        path,
        message: `评分引用了不存在的模型版本：${competition.scores.model_version}`,
      });
      continue;
    }

    const dimensionIds = new Set(model.dimensions.map((dimension) => dimension.id));
    for (const dimensionId of Object.keys(competition.scores.dimension_scores)) {
      if (!dimensionIds.has(dimensionId)) {
        issues.push({
          severity: 'error',
          code: 'unknown_score_dimension',
          path,
          message: `评分包含模型未定义的维度：${dimensionId}`,
        });
      }
    }

    for (const dimension of model.dimensions) {
      const score = competition.scores.dimension_scores[dimension.id];
      if (!score) {
        issues.push({
          severity: 'warning',
          code: 'missing_score_dimension',
          path,
          message: `评分缺少维度：${dimension.id}，不会进入正式排名`,
        });
        continue;
      }
      if (score.evidence_level === 'low' && competition.scores.confidence_level === 'high') {
        issues.push({
          severity: 'warning',
          code: 'confidence_mismatch',
          path,
          message: `维度 ${dimension.id} 证据等级为 low，但整体置信度为 high`,
        });
      }
    }

    const allDimensionsPresent = model.dimensions.every((dimension) => {
      return Boolean(competition.scores?.dimension_scores[dimension.id]);
    });

    if (allDimensionsPresent) {
      const weighted = model.dimensions.reduce((total, dimension) => {
        const score = competition.scores?.dimension_scores[dimension.id]?.score ?? 0;
        return total + score * dimension.weight;
      }, 0);
      if (Math.abs(weighted - competition.scores.weighted_score) > 0.05) {
        issues.push({
          severity: 'error',
          code: 'weighted_score_mismatch',
          path,
          message: `存储总分 ${competition.scores.weighted_score.toFixed(2)} 与模型计算 ${weighted.toFixed(2)} 不一致`,
        });
      }
    }

    if (competition.scores.review_status === 'approved' && !competition.scores.reviewed_at) {
      issues.push({
        severity: 'error',
        code: 'approved_without_review_date',
        path,
        message: '评分已审核但缺少 reviewed_at',
      });
    }

    if (competition.scores.review_status === 'approved' && !competition.scores.reviewer_role) {
      issues.push({
        severity: 'warning',
        code: 'approved_without_reviewer_role',
        path,
        message: '评分已审核但未记录 reviewer_role',
      });
    }
  }

  for (const skill of bundle.skills) {
    const path = `skills/${skill.id}`;

    if (!skillDomainIds.has(skill.domain)) {
      issues.push({
        severity: 'error',
        code: 'unknown_skill_domain',
        path,
        message: `技能领域不在受控词表中：${skill.domain}`,
      });
    }

    const levels = skill.levels.map((level) => level.level).sort();
    if (levels.join(',') !== '0,1,2,3,4') {
      issues.push({
        severity: 'error',
        code: 'invalid_skill_levels',
        path,
        message: '技能等级必须完整包含 0–4 且不重复',
      });
    }

    const taskIds = new Set<string>();
    for (const task of skill.practice_tasks) {
      if (taskIds.has(task.id)) {
        issues.push({
          severity: 'error',
          code: 'duplicate_practice_task',
          path,
          message: `练习任务 ID 重复：${task.id}`,
        });
      }
      taskIds.add(task.id);
      if (task.acceptance_criteria.length === 0) {
        issues.push({
          severity: 'error',
          code: 'task_without_acceptance',
          path,
          message: `任务 ${task.id} 缺少验收标准`,
        });
      }
    }

    for (const resourceId of skill.resource_ids) {
      if (!resourceMap.has(resourceId)) {
        issues.push({
          severity: 'error',
          code: 'missing_resource_reference',
          path,
          message: `引用了不存在的资源：${resourceId}`,
        });
      }
    }

    for (const competitionId of skill.related_competition_ids) {
      if (!competitionMap.has(competitionId)) {
        issues.push({
          severity: 'error',
          code: 'missing_competition_reference',
          path,
          message: `引用了不存在的竞赛：${competitionId}`,
        });
      }
    }

    for (const projectId of skill.related_project_ids) {
      if (!projectMap.has(projectId)) {
        issues.push({
          severity: 'error',
          code: 'missing_project_reference',
          path,
          message: `引用了不存在的项目：${projectId}`,
        });
      }
    }
  }

  const cycle = findSkillCycle(bundle.skills);
  if (cycle) {
    issues.push({
      severity: 'error',
      code: 'skill_dependency_cycle',
      path: 'skills',
      message: `技能依赖存在循环：${cycle.join(' → ')}`,
    });
  }

  for (const missing of missingPrerequisites(bundle.skills)) {
    issues.push({
      severity: 'error',
      code: 'missing_prerequisite',
      path: `skills/${missing.skill}`,
      message: `前置技能不存在：${missing.missing.join('、')}`,
    });
  }

  for (const project of bundle.projects) {
    const path = `projects/${project.id}`;
    for (const competitionId of project.competition_ids) {
      if (!competitionMap.has(competitionId)) {
        issues.push({
          severity: 'error',
          code: 'missing_competition_reference',
          path,
          message: `项目引用了不存在的竞赛：${competitionId}`,
        });
      }
    }
    for (const contribution of project.team_contributions) {
      if (!contribution.consent_confirmed) {
        issues.push({
          severity: 'error',
          code: 'contribution_without_consent',
          path,
          message: '团队成员贡献必须确认获得发布同意',
        });
      }
    }
    if (project.verification_status === 'verified' && !project.last_verified_at) {
      issues.push({
        severity: 'error',
        code: 'verified_without_date',
        path,
        message: 'verified 项目必须填写 last_verified_at',
      });
    }
    if (project.is_example && project.verification_status === 'verified') {
      issues.push({
        severity: 'error',
        code: 'example_verified',
        path,
        message: '示例项目不得标记为 verified',
      });
    }
  }

  for (const resource of bundle.resources) {
    const path = `resources/${resource.id}`;
    if (resource.free_status === 'paid' && !resource.license_or_access_terms) {
      issues.push({
        severity: 'error',
        code: 'paid_without_terms',
        path,
        message: '付费资源必须说明访问/授权条款',
      });
    }
    for (const skillId of resource.related_skill_ids) {
      if (!skillMap.has(skillId)) {
        issues.push({
          severity: 'error',
          code: 'missing_skill_reference',
          path,
          message: `资源引用了不存在的技能：${skillId}`,
        });
      }
    }
    for (const domain of resource.domains) {
      if (domainIds.size > 0 && !domainIds.has(domain)) {
        issues.push({
          severity: 'error',
          code: 'unknown_domain',
          path,
          message: `资源领域不在受控词表中：${domain}`,
        });
      }
    }
    checkDate(resource.last_checked_at, path, asOf, issues, 'warning');
  }

  for (const roadmap of bundle.roadmaps) {
    const path = `roadmaps/${roadmap.id}`;
    const taskIds = new Set(roadmap.tasks.map((task) => task.id));
    const phaseTaskIds = new Set<string>();

    for (const phase of roadmap.phases) {
      for (const taskId of phase.task_ids) {
        if (!taskIds.has(taskId)) {
          issues.push({
            severity: 'error',
            code: 'missing_roadmap_task',
            path,
            message: `阶段 ${phase.id} 引用了不存在的任务：${taskId}`,
          });
        }
        phaseTaskIds.add(taskId);
      }
    }

    for (const taskId of taskIds) {
      if (!phaseTaskIds.has(taskId)) {
        issues.push({
          severity: 'warning',
          code: 'task_without_phase',
          path,
          message: `任务 ${taskId} 未被任何阶段引用`,
        });
      }
    }

    for (const target of roadmap.target_skill_levels) {
      if (!skillMap.has(target.skill_id)) {
        issues.push({
          severity: 'error',
          code: 'missing_skill_reference',
          path,
          message: `路线目标技能不存在：${target.skill_id}`,
        });
      }
    }

    for (const competitionId of roadmap.target_competition_ids) {
      if (!competitionMap.has(competitionId)) {
        issues.push({
          severity: 'error',
          code: 'missing_competition_reference',
          path,
          message: `路线目标竞赛不存在：${competitionId}`,
        });
      }
    }

    for (const projectId of roadmap.target_project_ids) {
      if (!projectMap.has(projectId)) {
        issues.push({
          severity: 'error',
          code: 'missing_project_reference',
          path,
          message: `路线目标项目不存在：${projectId}`,
        });
      }
    }

    for (const resourceId of roadmap.resource_ids) {
      if (!resourceMap.has(resourceId)) {
        issues.push({
          severity: 'error',
          code: 'missing_resource_reference',
          path,
          message: `路线引用了不存在的资源：${resourceId}`,
        });
      }
    }

    for (const task of roadmap.tasks) {
      if (task.skill_id && !skillMap.has(task.skill_id)) {
        issues.push({
          severity: 'error',
          code: 'missing_skill_reference',
          path,
          message: `任务 ${task.id} 引用了不存在的技能：${task.skill_id}`,
        });
      }
      if (task.acceptance_criteria.length === 0) {
        issues.push({
          severity: 'error',
          code: 'task_without_acceptance',
          path,
          message: `路线任务 ${task.id} 缺少验收标准`,
        });
      }
    }
  }

  for (const review of bundle.reviews) {
    const path = `reviews/${review.id}`;
    if (!competitionMap.has(review.competition_id)) {
      issues.push({
        severity: 'error',
        code: 'missing_competition_reference',
        path,
        message: `评价引用了不存在的竞赛：${review.competition_id}`,
      });
    }
    if (review.verification_status === 'approved') {
      if (!review.consent_public) {
        issues.push({
          severity: 'error',
          code: 'review_without_consent',
          path,
          message: '已审核评价必须获得公开展示同意',
        });
      }
      if (!review.reviewed_at) {
        issues.push({
          severity: 'error',
          code: 'review_without_review_date',
          path,
          message: '已审核评价必须填写 reviewed_at',
        });
      }
      if (review.participated && (!review.track || review.year === null)) {
        issues.push({
          severity: 'error',
          code: 'review_missing_participation_context',
          path,
          message: '参加过竞赛的评价必须填写赛道与参赛年份',
        });
      }
      if (review.is_example) {
        issues.push({
          severity: 'error',
          code: 'example_review_approved',
          path,
          message: '示例评价不得标记为 approved',
        });
      }
    }
    if (review.participated === false && (review.track || review.year !== null)) {
      issues.push({
        severity: 'warning',
        code: 'review_context_mismatch',
        path,
        message: '未参加过竞赛但填写了赛道或年份，请确认是否准确',
      });
    }
    checkDate(review.submitted_at, path, asOf, issues, 'warning');
    checkDate(review.reviewed_at, path, asOf, issues);
  }

  const jobRoleIds = new Set(
    bundle.vocabularies.find((item) => item.id === 'job-roles')?.terms.map((term) => term.id) ?? [],
  );
  for (const company of bundle.companies) {
    const path = `companies/${company.id}`;
    for (const roleId of company.role_ids) {
      if (!jobRoleIds.has(roleId)) {
        issues.push({
          severity: 'error',
          code: 'unknown_job_role',
          path,
          message: `企业引用了不存在的岗位方向：${roleId}`,
        });
      }
    }
    for (const preference of company.competition_preferences) {
      if (!competitionMap.has(preference.competition_id)) {
        issues.push({
          severity: 'error',
          code: 'missing_competition_reference',
          path,
          message: `企业招聘偏好引用了不存在的竞赛：${preference.competition_id}`,
        });
      }
      checkDate(preference.accessed_at, path, asOf, issues, 'warning');
    }
    if (company.verification_status === 'verified' && !company.last_verified_at) {
      issues.push({
        severity: 'error',
        code: 'verified_without_date',
        path,
        message: 'verified 企业必须填写 last_verified_at',
      });
    }
  }

  const contentSlugs = new Set<string>();
  for (const content of contents) {
    const path = `content/guides/${content.slug}.md`;
    if (contentSlugs.has(content.slug)) {
      issues.push({
        severity: 'error',
        code: 'duplicate_content_slug',
        path,
        message: `内容 slug 重复：${content.slug}`,
      });
    }
    contentSlugs.add(content.slug);

    for (const competitionId of content.frontmatter.related_competition_ids) {
      if (!competitionMap.has(competitionId)) {
        issues.push({
          severity: 'error',
          code: 'missing_competition_reference',
          path,
          message: `文章引用了不存在的竞赛：${competitionId}`,
        });
      }
    }

    for (const skillId of content.frontmatter.related_skill_ids) {
      if (!skillMap.has(skillId)) {
        issues.push({
          severity: 'error',
          code: 'missing_skill_reference',
          path,
          message: `文章引用了不存在的技能：${skillId}`,
        });
      }
    }
  }

  if (bundle.roadmaps.length === 0) {
    issues.push({
      severity: 'warning',
      code: 'no_roadmaps',
      path: 'roadmaps',
      message: '尚未配置成长路线模板',
    });
  }

  return issues;
}

export function summarizeIssues(issues: ValidationIssue[]): {
  errors: number;
  warnings: number;
} {
  return {
    errors: issues.filter((issue) => issue.severity === 'error').length,
    warnings: issues.filter((issue) => issue.severity === 'warning').length,
  };
}
