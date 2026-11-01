# 数据模型

- Schema 版本：`1.0.0`
- 唯一事实来源：`src/lib/domain/schemas.ts`（Zod）
- 生成的 JSON Schema：`data/schemas/*.schema.json`
- 校验脚本：`scripts/validate-data.ts` + `src/lib/domain/validateDataset.ts`

## 1. 通用约定

- 字段名使用 `snake_case`。
- 日期使用 `YYYY-MM-DD`；只有年份/周期时写在 `notes`，不伪造具体日期。
- 稳定 ID 使用小写 kebab-case，不随年份改变。
- 标签使用 `data/vocabularies/` 中的受控词表。
- 未知文本/日期：`null`；未知列表：`[]`；未知评分：`scores: null`。
- `null`、`not_applicable`、`pending_verification` 语义不同，不混用。
- 记录修改历史依赖 Git；重要事实变化写入 `CHANGELOG.md`。

## 2. 数据状态

| 状态           | 含义                         | 是否公开           | 是否可进正式排名 |
| -------------- | ---------------------------- | ------------------ | ---------------- |
| `draft`        | 草稿，尚在整理               | 可明确标注展示     | 否               |
| `needs_review` | 已录入，关键事实待核验       | 是                 | 否               |
| `verified`     | 关键事实有来源并记录核验日期 | 是                 | 满足其他条件时可 |
| `stale`        | 距上次核验较久               | 是（提示可能过期） | 否               |
| `rejected`     | 来源不足/重复/不合规         | 否                 | 否               |

`verified` 不代表所有字段永远正确；未知字段仍必须保持未知。

## 3. Competition（竞赛）

文件：`data/competitions/<id>.json`

| 字段                        | 必填 | 类型        | 说明                                                                           |
| --------------------------- | ---- | ----------- | ------------------------------------------------------------------------------ |
| `schema_version`            | 是   | `"1.0.0"`   | Schema 版本                                                                    |
| `is_example`                | 是   | boolean     | 示例数据必须为 true，且不得在正式目录                                          |
| `id`                        | 是   | slug        | 稳定 ID，文件名必须一致                                                        |
| `name`                      | 是   | string      | 官方名称                                                                       |
| `aliases`                   | 是   | string[]    | 简称/别名，可为空                                                              |
| `organizers`                | 是   | object[]    | `{name, role, url}`；role 为 host/organizer/co-organizer/secretariat/sponsor   |
| `domains`                   | 是   | string[]    | 受控领域 ID，至少 1 个                                                         |
| `tracks`                    | 是   | object[]    | `{name, description, url}`；赛道/组别；未知时为空数组                          |
| `summary`                   | 是   | string      | 20–600 字                                                                      |
| `description`               | 是   | string      | 50–6000 字，客观描述                                                           |
| `audience`                  | 是   | object      | `{levels, notes}`；levels 来自词表                                             |
| `format`                    | 是   | object      | `{team_based, team_size, delivery_modes, notes}`                               |
| `equipment`                 | 是   | object      | `{type, description, requirements}`；type 见设备规则                           |
| `difficulty`                | 是   | object      | `{level: 1–5, rationale}`，平台自定义                                          |
| `estimated_cost`            | 是   | object      | `{amount, currency, status, basis, notes}`；未知时 amount=null、status=unknown |
| `skills_required`           | 是   | object[]    | `{skill_id, target_level: 0–4}`                                                |
| `schedule`                  | 是   | object      | 四个日期可 null；`status` 为 confirmed/partial/expected/unknown/not_applicable |
| `official_urls`             | 是   | object[]    | `{label, url}`，至少 1 个                                                      |
| `sources`                   | 是   | Source[]    | 至少 1 条                                                                      |
| `external_lists`            | 是   | object[]    | 外部目录/榜单引用；不参与评分；可为空数组                                      |
| `verification_status`       | 是   | enum        | 状态见上                                                                       |
| `last_verified_at`          | 是   | date/null   | verified 时必须填写                                                            |
| `created_at` / `updated_at` | 是   | date        | `updated_at` 不早于 `created_at`                                               |
| `scoring_model_version`     | 是   | string/null | 有评分时填写                                                                   |
| `scores`                    | 是   | object/null | 见 Rating                                                                      |
| `notes`                     | 是   | string/null | 已知局限、争议、待核验说明                                                     |

### 时间规则

- `schedule.status = confirmed` 时至少有一个日期。
- 报名开始不得晚于报名结束。
- 没有来源的日期必须为 null，并在 `notes` 说明“待核验”。

### 费用规则

- `status = verified` 时必须有 `amount`。
- 未知费用不得写成 `free` 或 0。
- 估算必须使用 `estimated` 并在 `basis`/`notes` 说明。

### 设备规则

`equipment.type` 只允许：

- `none`：无需专用设备，主要使用电脑/软件；
- `off_the_shelf`：使用成品设备、商用开发板、实验箱或成套软硬件；
- `self_built`：团队自行制作机器人、电路、机械装置等；
- `unknown`：官方来源未确认设备要求。

`equipment.description` 用于成品/自制设备简介，可为 null；`equipment.requirements` 用于自制设备的加工、调试、安全或场地要求，可为 null。没有来源时使用 `unknown`，不要把猜测写成“无需设备”。

### 外部目录规则

`external_lists` 字段记录竞赛被外部目录/榜单收录的情况，例如高校常用的“A 类”竞赛目录。它只作检索线索：

- 每条引用必须有名称、发布方、年份、口径、URL 与访问日期；
- 不得因为进入某个目录/榜单而自动提高平台评分；
- 不得把目录排名写成“官方认可度”“技术含量”或“官方排名”；
- 目录名称与平台名称不一致时，在 `notes` 说明（例如使用原赛事名）；
- 评分引擎不读取该字段，正式排名也不使用它。

## 3.1 Company（企业/招聘信息）

文件：`data/companies/<id>.json`。只记录公开校招入口、岗位方向与有来源的竞赛直通/优先条款。

| 字段                      | 说明                                                                  |
| ------------------------- | --------------------------------------------------------------------- |
| `name` / `aliases`        | 企业名称与别名                                                        |
| `industry`                | 行业                                                                  |
| `website` / `careers_url` | 官网与官方校招入口                                                    |
| `role_ids`                | 岗位方向 ID，来自 `job-roles` 词表                                    |
| `competition_preferences` | `{competition_id, status, statement, source_url, accessed_at, notes}` |
| `hiring_programs`         | `{name, description, url}` 校园招聘/实习项目                          |
| `sources`                 | 官方招聘页或公告来源                                                  |
| `verification_status`     | 是否已核验                                                            |

`competition_preferences.status`：

- `direct_channel`：官方明确直通面试/免笔试等；
- `priority`：官方明确优先；
- `plus`：可参与专属通道/加分，但不保证直通；
- `no_public_channel`：已查看的官方入口未公开；
- `unknown`：待核验。

没有官方原文时不得把“参赛经历”写成“保证录用”或“直通”。岗位方向词表：`data/vocabularies/job-roles.json`。

## 4. Source（来源）

```json
{
  "id": "mcm-home",
  "title": "全国大学生数学建模竞赛官网首页",
  "url": "https://www.mcm.edu.cn/",
  "publisher": "全国大学生数学建模竞赛组委会",
  "source_type": "official",
  "published_at": null,
  "accessed_at": "2026-11-01",
  "supports": ["name", "organizers", "schedule.event_start"],
  "confidence": "high",
  "notes": "于 2026-11-01 访问。"
}
```

`source_type`：official、organizer、institutional、news、community、research。社区经验不能作为官方规则或报名时间的唯一来源。

## 5. Skill（技能）

文件：`data/skills/<id>.json`

| 字段                                              | 说明                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------- |
| `id` / `name` / `domain`                          | domain 来自 `skill-domains` 词表                                    |
| `definition`                                      | 至少 20 字，说明能力边界                                            |
| `levels`                                          | 必须完整包含 L0–L4，每级有可观察行为                                |
| `prerequisite_skill_ids`                          | 前置技能；不得成环                                                  |
| `practice_tasks`                                  | 至少 1 个；每个含目标、前置、步骤、产出物、验收标准、工时、常见失败 |
| `resource_ids`                                    | 必须存在                                                            |
| `related_competition_ids` / `related_project_ids` | 必须存在                                                            |
| `sources`                                         | 至少 1 条                                                           |
| `maintainer` / `updated_at`                       | 维护者与更新时间                                                    |

等级是规划框架，不是认证。自评、导师评价与项目证据必须分开记录。

## 6. Project（项目）

文件：`data/projects/<id>.json`

关键字段：`title`、`summary`、`domains`、`technologies`、`competition_ids`、`repository_url`、`demo_url`、`documentation_url`、`team_contributions`（含 `consent_confirmed`）、`problem_statement`、`approach`、`reproducibility`（environment/dependencies/run_steps/test_method）、`results`、`limitations`、`license`、`evidence_urls`、`verification_status`、`submitted_by`、`last_verified_at`、`created_at`、`updated_at`。

审核状态与官方获奖事实分开；平台不为原创性、质量或获奖真实性作保证。

## 7. Resource（资源）

文件：`data/resources/<id>.json`

字段：`title`、`resource_type`、`url`、`language`、`level`、`domains`、`related_skill_ids`、`publisher`、`license_or_access_terms`、`free_status`、`last_checked_at`、`notes`。

`free_status`：free/freemium/paid/unknown。只保存标题、简介与原链接，不复制受版权保护内容；“免费可读”不等于“允许转载”。

## 8. Roadmap（路线模板）

文件：`data/roadmaps/<id>.json`

字段：`title`、`goal_type`、`summary`、`target_competition_ids`、`target_project_ids`、`target_skill_levels`、`phases`、`tasks`、`estimated_hours`、`acceptance_criteria`、`resource_ids`、`assumptions`、`version`、`updated_at`。

- 每个 phase 的 `task_ids` 必须存在；
- 每个 task 必须有产出物/验收标准；
- 路线目标技能、竞赛、项目、资源必须存在；
- `assumptions` 说明时间、设备或前置条件。

## 9. Scoring model（评分模型）

文件：`data/scoring-models/<id>-<version>.json`

字段：`id`、`version`、`effective_from`、`title`、`description`、`dimensions`（id/name/weight/description/scoring_guidance）、`eligibility`、`missing_data_policy`、`tie_policy`、`changelog`。

- 权重之和必须为 1（浮点误差 1e-9）；
- 维度 ID 唯一，分数 0–100；
- 版本为 semver；
- 变更必须记录 `changelog`；
- 正式排名准入要求数据 verified、评分 approved、置信度 ≥ medium、六维齐全、核验在 18 个月内。

## 10. Rating（评分记录）

嵌入在 `competition.scores`：

| 字段                            | 说明                                                 |
| ------------------------------- | ---------------------------------------------------- |
| `model_version`                 | 必须对应存在的评分模型版本                           |
| `dimension_scores`              | `{dimension_id: {score, rationale, evidence_level}}` |
| `weighted_score`                | 存储的总分；校验脚本会按模型重算并比对               |
| `evidence_summary`              | 至少 20 字，说明证据与局限                           |
| `sample_size`                   | 可选样本量；没有可靠样本时 null                      |
| `confidence_level`              | high/medium/low                                      |
| `review_status`                 | draft/in_review/approved                             |
| `reviewed_at` / `reviewer_role` | 审核记录；approved 时必须记录日期                    |
| `notes`                         | 争议、估算、限制                                     |

评分是平台方法论评估，不是官方分数。

## 10.1 Community review（社区参赛评价）

文件：`data/reviews/<id>.json`。只保存审核通过后允许公开的评价；公开站点只加载 `verification_status: approved` 且 `consent_public: true` 的记录。

| 字段                  | 必填 | 说明                                             |
| --------------------- | ---- | ------------------------------------------------ |
| `id`                  | 是   | 稳定 ID                                          |
| `competition_id`      | 是   | 必须对应存在的竞赛                               |
| `rating`              | 是   | 1–5 的整数，用户自述综合评分                     |
| `participated`        | 是   | 是否参加过                                       |
| `track`               | 是   | 赛道/组别；`participated=true` 时必填            |
| `year`                | 是   | 参赛年份；`participated=true` 时必填             |
| `school`              | 是   | 学校（可公开）；可为 null，不要求填写            |
| `role`                | 是   | participant/team_lead/advisor/organizer/observer |
| `public_profile`      | 是   | GitHub 用户名或公开主页；可为 null               |
| `review`              | 是   | 至少 20 字，不得包含手机号、身份证或真实姓名     |
| `evidence_url`        | 是   | 公开证据链接；可为 null                          |
| `consent_public`      | 是   | 必须为 true 才能审核通过                         |
| `verification_status` | 是   | pending/approved/rejected                        |
| `submitted_at`        | 是   | 提交日期                                         |
| `reviewed_at`         | 是   | 审核日期；approved 时必填                        |
| `notes`               | 是   | 审核备注；可为 null                              |

规则：

- 社区评分是用户自述，**不参与平台六维评分，也不进入正式排行榜**；
- 公开页展示评分、是否参加过、赛道、年份、学校（若提供）、角色、公开主页、评价与证据链接；
- 未审核、不同意公开、示例评价不展示；
- 学校、年份、赛道属于用户主动公开的信息；平台不要求真实姓名或联系方式；
- 审核者应检查内容是否包含敏感信息、未授权材料或人身攻击。

## 11. Vocabulary（词表）

文件：`data/vocabularies/<id>.json`

字段：`id`、`label`、`description`、`terms[{id,label,description}]`。当前词表：domains、audience-levels、difficulty-levels、skill-domains、verification-statuses、cost-statuses、source-types、evidence-levels。

新增领域/标签必须先改词表并通过 PR，避免同义标签被拆成无关领域。

## 12. Content（Markdown）

文件：`content/guides/<slug>.md`

frontmatter：

```yaml
title: 标题
summary: 至少 20 字的摘要
category: guide | retrospective | announcement
tags: [标签]
author: 作者或维护者
updated_at: '2026-11-01'
draft: false
related_competition_ids: []
related_skill_ids: []
```

正文使用 Markdown；渲染时不启用原始 HTML。引用数据必须回到来源核对；文章是社区观点，不替代官方规则。

## 13. 示例数据

`data/examples/` 中的记录必须：

- `is_example: true`；
- 不得为 `verified`；
- 不进入公开 Repository 或排行榜；
- 不引用真实竞赛事实或冒充官方来源。

测试 fixture 与示例数据同样不进入生产数据。

## 14. 校验规则清单

`npm run data:validate` 检查：

- Schema 必填、类型、范围、URL、日期；
- 文件名与 ID 一致；
- 集合内重复 ID、词表重复词项；
- 竞赛引用的技能、技能引用的资源/竞赛/项目、路线引用的任务/资源/技能；
- 技能依赖环与缺失前置；
- 评分权重、维度、存储总分、审核日期、置信度；
- verified 条目的来源与核验日期；
- confirmed 日程、费用状态、日期顺序、未来日期；
- 示例数据隔离；
- 内容 frontmatter、重复 slug、文章引用。

错误使 CI 失败；警告不阻断但会在输出中列出。

## 15. 新增一条数据

1. 复制 `data/examples/example-competition.json` 或现有记录。
2. 删除 `is_example` 或设为 false。
3. 填写稳定 ID、官方名称、来源（URL/发布方/访问日期）、领域、对象、形式、难度。
4. 无法确认的字段保持 null，并在 `notes` 写“待核验”。
5. 状态设为 `needs_review`；完成核验后改为 `verified` 并填写 `last_verified_at`。
6. 运行 `npm run data:validate`、`npm run data:schemas:check`、`npm test`、`npm run build`。
7. 提交 PR，说明来源与仍未知的字段。
