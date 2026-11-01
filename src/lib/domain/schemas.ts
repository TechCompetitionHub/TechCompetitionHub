import { z } from 'zod';

/**
 * 数据 Schema 是唯一事实来源：TypeScript 类型由 z.infer 推导，
 * JSON Schema 由 scripts/generate-schemas.ts 从同一组 Schema 生成。
 *
 * 未知值约定：
 * - 未知文本/日期：null，并在 UI 显示“待核验”
 * - 未知数值：null
 * - 未知列表：空数组
 * 禁止用 0 或 100 表示未知评分。
 */

export const SCHEMA_VERSION = '1.0.0' as const;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const isoDateSchema = z
  .string()
  .regex(ISO_DATE_PATTERN, '日期必须使用 YYYY-MM-DD 格式')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, '日期不是有效的公历日期');

export const slugSchema = z
  .string()
  .min(1)
  .max(96)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'ID 必须是小写 kebab-case');

const PLACEHOLDER_HOSTS = ['example.com', 'example.org', 'localhost', '127.0.0.1', '0.0.0.0'];

export const httpUrlSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  }, '必须是 http(s) URL')
  .refine((value) => {
    try {
      const host = new URL(value).hostname.toLowerCase();
      return !PLACEHOLDER_HOSTS.includes(host);
    } catch {
      return false;
    }
  }, '不得使用占位域名');

export const verificationStatusSchema = z.enum([
  'draft',
  'needs_review',
  'verified',
  'stale',
  'rejected',
]);

export const evidenceLevelSchema = z.enum(['high', 'medium', 'low']);

export const confidenceLevelSchema = z.enum(['high', 'medium', 'low']);

export const sourceTypeSchema = z.enum([
  'official',
  'organizer',
  'institutional',
  'news',
  'community',
  'research',
]);

export const sourceSchema = z
  .object({
    id: slugSchema,
    title: z.string().trim().min(2).max(240),
    url: httpUrlSchema,
    publisher: z.string().trim().min(1).max(160),
    source_type: sourceTypeSchema,
    published_at: isoDateSchema.nullable(),
    accessed_at: isoDateSchema,
    supports: z.array(z.string().trim().min(1)).min(1),
    confidence: evidenceLevelSchema.nullable(),
    notes: z.string().trim().max(1000).nullable(),
  })
  .strict();

export type Source = z.infer<typeof sourceSchema>;

const organizerSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    role: z.enum(['host', 'organizer', 'co-organizer', 'secretariat', 'sponsor']),
    url: httpUrlSchema.nullable(),
  })
  .strict();

const officialUrlSchema = z
  .object({
    label: z.string().trim().min(1).max(80),
    url: httpUrlSchema,
  })
  .strict();

const externalListReferenceSchema = z
  .object({
    id: slugSchema,
    name: z.string().trim().min(5).max(300),
    publisher: z.string().trim().min(2).max(300),
    year: z.number().int().min(2000).max(2100),
    category: z.string().trim().min(2).max(120),
    url: httpUrlSchema,
    accessed_at: isoDateSchema,
    notes: z.string().trim().max(1000).nullable(),
  })
  .strict();

export type ExternalListReference = z.infer<typeof externalListReferenceSchema>;

const audienceSchema = z
  .object({
    levels: z.array(z.string().trim().min(1)).min(1),
    notes: z.string().trim().max(1000).nullable(),
  })
  .strict();

const teamSizeSchema = z
  .object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  })
  .strict();

const formatSchema = z
  .object({
    team_based: z.boolean(),
    team_size: teamSizeSchema.nullable(),
    delivery_modes: z.array(z.enum(['online', 'offline', 'hybrid'])).min(1),
    notes: z.string().trim().max(1000).nullable(),
  })
  .strict();

const difficultySchema = z
  .object({
    level: z.number().int().min(1).max(5),
    rationale: z.string().trim().min(10).max(1000),
  })
  .strict();

const estimatedCostSchema = z
  .object({
    amount: z.number().nonnegative().nullable(),
    currency: z.string().trim().length(3),
    status: z.enum(['free', 'verified', 'estimated', 'unknown', 'not_applicable']),
    basis: z.string().trim().max(1000).nullable(),
    notes: z.string().trim().max(1000).nullable(),
  })
  .strict();

const scheduleSchema = z
  .object({
    registration_start: isoDateSchema.nullable(),
    registration_end: isoDateSchema.nullable(),
    event_start: isoDateSchema.nullable(),
    event_end: isoDateSchema.nullable(),
    status: z.enum(['confirmed', 'partial', 'expected', 'unknown', 'not_applicable']),
    notes: z.string().trim().max(1000).nullable(),
  })
  .strict();

const skillRequirementSchema = z
  .object({
    skill_id: slugSchema,
    target_level: z.number().int().min(0).max(4),
  })
  .strict();

const dimensionScoreSchema = z
  .object({
    score: z.number().min(0).max(100),
    rationale: z.string().trim().min(10).max(2000),
    evidence_level: evidenceLevelSchema,
  })
  .strict();

export const competitionScoreSchema = z
  .object({
    model_version: z.string().trim().min(1),
    dimension_scores: z.record(z.string(), dimensionScoreSchema),
    weighted_score: z.number().min(0).max(100),
    evidence_summary: z.string().trim().min(20).max(4000),
    sample_size: z.number().int().nonnegative().nullable(),
    confidence_level: confidenceLevelSchema,
    review_status: z.enum(['draft', 'in_review', 'approved']),
    reviewed_at: isoDateSchema.nullable(),
    reviewer_role: z.string().trim().max(160).nullable(),
    notes: z.string().trim().max(2000).nullable(),
  })
  .strict();

export type CompetitionScore = z.infer<typeof competitionScoreSchema>;

export const competitionSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    is_example: z.boolean(),
    id: slugSchema,
    name: z.string().trim().min(2).max(200),
    aliases: z.array(z.string().trim().min(1).max(120)),
    organizers: z.array(organizerSchema),
    domains: z.array(z.string().trim().min(1)).min(1),
    summary: z.string().trim().min(20).max(600),
    description: z.string().trim().min(50).max(6000),
    audience: audienceSchema,
    format: formatSchema,
    difficulty: difficultySchema,
    estimated_cost: estimatedCostSchema,
    skills_required: z.array(skillRequirementSchema),
    schedule: scheduleSchema,
    official_urls: z.array(officialUrlSchema).min(1),
    sources: z.array(sourceSchema).min(1),
    external_lists: z.array(externalListReferenceSchema),
    verification_status: verificationStatusSchema,
    last_verified_at: isoDateSchema.nullable(),
    created_at: isoDateSchema,
    updated_at: isoDateSchema,
    scoring_model_version: z.string().trim().min(1).nullable(),
    scores: competitionScoreSchema.nullable(),
    notes: z.string().trim().max(2000).nullable(),
  })
  .strict();

export type Competition = z.infer<typeof competitionSchema>;

const skillLevelSchema = z
  .object({
    level: z.number().int().min(0).max(4),
    label: z.string().trim().min(1).max(40),
    behavior: z.string().trim().min(8).max(1000),
  })
  .strict();

const practiceTaskSchema = z
  .object({
    id: slugSchema,
    title: z.string().trim().min(2).max(160),
    level: z.number().int().min(0).max(4),
    goal: z.string().trim().min(10).max(1000),
    prerequisites: z.array(z.string().trim().min(1).max(300)).min(1),
    steps: z.array(z.string().trim().min(1).max(600)).min(1),
    deliverables: z.array(z.string().trim().min(1).max(600)).min(1),
    acceptance_criteria: z.array(z.string().trim().min(1).max(600)).min(1),
    estimated_hours: z.number().positive().nullable(),
    common_failures: z.array(z.string().trim().min(1).max(600)).min(1),
  })
  .strict();

export type PracticeTask = z.infer<typeof practiceTaskSchema>;

export const skillSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    is_example: z.boolean(),
    id: slugSchema,
    name: z.string().trim().min(2).max(120),
    domain: z.string().trim().min(1),
    definition: z.string().trim().min(20).max(2000),
    levels: z.array(skillLevelSchema).length(5),
    prerequisite_skill_ids: z.array(slugSchema),
    practice_tasks: z.array(practiceTaskSchema).min(1),
    resource_ids: z.array(slugSchema),
    related_competition_ids: z.array(slugSchema),
    related_project_ids: z.array(slugSchema),
    sources: z.array(sourceSchema).min(1),
    maintainer: z.string().trim().min(1).max(160),
    updated_at: isoDateSchema,
  })
  .strict();

export type Skill = z.infer<typeof skillSchema>;
export type SkillLevel = z.infer<typeof skillLevelSchema>;

const teamContributionSchema = z
  .object({
    role: z.string().trim().min(1).max(120),
    contributor_handle: z.string().trim().min(1).max(80).nullable(),
    contribution: z.string().trim().min(10).max(1000),
    consent_confirmed: z.boolean(),
  })
  .strict();

const reproducibilitySchema = z
  .object({
    environment: z.string().trim().min(10).max(1000),
    dependencies: z.array(z.string().trim().min(1).max(300)),
    run_steps: z.array(z.string().trim().min(1).max(600)).min(1),
    test_method: z.string().trim().min(10).max(2000),
  })
  .strict();

export const projectSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    is_example: z.boolean(),
    id: slugSchema,
    title: z.string().trim().min(2).max(200),
    summary: z.string().trim().min(20).max(600),
    domains: z.array(z.string().trim().min(1)).min(1),
    technologies: z.array(z.string().trim().min(1).max(80)).min(1),
    competition_ids: z.array(slugSchema),
    repository_url: httpUrlSchema.nullable(),
    demo_url: httpUrlSchema.nullable(),
    documentation_url: httpUrlSchema.nullable(),
    team_contributions: z.array(teamContributionSchema),
    problem_statement: z.string().trim().min(20).max(3000),
    approach: z.string().trim().min(20).max(4000),
    reproducibility: reproducibilitySchema,
    results: z.string().trim().min(10).max(3000),
    limitations: z.string().trim().min(10).max(3000),
    license: z.string().trim().min(1).max(200),
    evidence_urls: z.array(httpUrlSchema),
    verification_status: verificationStatusSchema,
    submitted_by: z.string().trim().min(1).max(120).nullable(),
    last_verified_at: isoDateSchema.nullable(),
    created_at: isoDateSchema,
    updated_at: isoDateSchema,
    notes: z.string().trim().max(2000).nullable(),
  })
  .strict();

export type Project = z.infer<typeof projectSchema>;

export const resourceSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    is_example: z.boolean(),
    id: slugSchema,
    title: z.string().trim().min(2).max(200),
    resource_type: z.enum([
      'documentation',
      'course',
      'book',
      'tool',
      'dataset',
      'article',
      'video',
      'community',
    ]),
    url: httpUrlSchema,
    language: z.string().trim().min(2).max(20),
    level: z.number().int().min(0).max(4),
    domains: z.array(z.string().trim().min(1)).min(1),
    related_skill_ids: z.array(slugSchema),
    publisher: z.string().trim().min(1).max(160),
    license_or_access_terms: z.string().trim().min(5).max(500),
    free_status: z.enum(['free', 'freemium', 'paid', 'unknown']),
    last_checked_at: isoDateSchema,
    notes: z.string().trim().max(1000).nullable(),
  })
  .strict();

export type Resource = z.infer<typeof resourceSchema>;

const roadmapTaskSchema = z
  .object({
    id: slugSchema,
    title: z.string().trim().min(2).max(160),
    skill_id: slugSchema.nullable(),
    goal: z.string().trim().min(10).max(1000),
    deliverables: z.array(z.string().trim().min(1).max(600)).min(1),
    acceptance_criteria: z.array(z.string().trim().min(1).max(600)).min(1),
    estimated_hours: z.number().positive().nullable(),
  })
  .strict();

const roadmapPhaseSchema = z
  .object({
    id: slugSchema,
    title: z.string().trim().min(2).max(160),
    goal: z.string().trim().min(10).max(1000),
    task_ids: z.array(slugSchema).min(1),
  })
  .strict();

const targetSkillLevelSchema = z
  .object({
    skill_id: slugSchema,
    target_level: z.number().int().min(0).max(4),
  })
  .strict();

export const roadmapSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    is_example: z.boolean(),
    id: slugSchema,
    title: z.string().trim().min(2).max(200),
    goal_type: z.enum(['competition', 'skill_direction', 'project']),
    summary: z.string().trim().min(20).max(600),
    target_competition_ids: z.array(slugSchema),
    target_project_ids: z.array(slugSchema),
    target_skill_levels: z.array(targetSkillLevelSchema).min(1),
    phases: z.array(roadmapPhaseSchema).min(1),
    tasks: z.array(roadmapTaskSchema).min(1),
    estimated_hours: z.number().positive().nullable(),
    acceptance_criteria: z.array(z.string().trim().min(1).max(600)).min(1),
    resource_ids: z.array(slugSchema),
    assumptions: z.array(z.string().trim().min(1).max(600)).min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/, '版本必须是 semver'),
    updated_at: isoDateSchema,
  })
  .strict();

export type Roadmap = z.infer<typeof roadmapSchema>;

const scoringDimensionSchema = z
  .object({
    id: z.string().trim().min(2).max(60),
    name: z.string().trim().min(2).max(80),
    weight: z.number().positive().max(1),
    description: z.string().trim().min(20).max(1000),
    scoring_guidance: z.string().trim().min(20).max(2000),
  })
  .strict();

const eligibilitySchema = z
  .object({
    required_verification_status: z.array(verificationStatusSchema).min(1),
    required_review_status: z.array(z.enum(['draft', 'in_review', 'approved'])).min(1),
    min_confidence: confidenceLevelSchema,
    require_all_dimensions: z.boolean(),
    min_score_coverage: z.number().min(0).max(1),
  })
  .strict();

const changelogEntrySchema = z
  .object({
    version: z.string().trim().min(1),
    date: isoDateSchema,
    change: z.string().trim().min(10).max(1000),
  })
  .strict();

export const scoringModelSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    id: slugSchema,
    version: z.string().regex(/^\d+\.\d+\.\d+$/, '版本必须是 semver'),
    effective_from: isoDateSchema,
    title: z.string().trim().min(2).max(200),
    description: z.string().trim().min(20).max(2000),
    dimensions: z.array(scoringDimensionSchema).min(1),
    eligibility: eligibilitySchema,
    missing_data_policy: z.enum(['exclude_from_official_ranking']),
    tie_policy: z.enum(['equal_scores_share_rank']),
    changelog: z.array(changelogEntrySchema).min(1),
  })
  .strict();

export type ScoringModel = z.infer<typeof scoringModelSchema>;
export type ScoringDimension = z.infer<typeof scoringDimensionSchema>;

const vocabularyTermSchema = z
  .object({
    id: z.string().trim().min(1).max(80),
    label: z.string().trim().min(1).max(120),
    description: z.string().trim().min(5).max(600),
  })
  .strict();

export const vocabularySchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    id: slugSchema,
    label: z.string().trim().min(1).max(120),
    description: z.string().trim().min(10).max(1000),
    terms: z.array(vocabularyTermSchema).min(1),
  })
  .strict();

export type Vocabulary = z.infer<typeof vocabularySchema>;
export type VocabularyTerm = z.infer<typeof vocabularyTermSchema>;

export const contentFrontmatterSchema = z
  .object({
    title: z.string().trim().min(2).max(200),
    summary: z.string().trim().min(20).max(600),
    category: z.enum(['guide', 'retrospective', 'announcement']),
    tags: z.array(z.string().trim().min(1).max(40)),
    author: z.string().trim().min(1).max(120),
    updated_at: isoDateSchema,
    draft: z.boolean(),
    related_competition_ids: z.array(slugSchema),
    related_skill_ids: z.array(slugSchema),
  })
  .strict();

export type ContentFrontmatter = z.infer<typeof contentFrontmatterSchema>;
