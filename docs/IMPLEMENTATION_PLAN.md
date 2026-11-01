# TechCompetitionHub 实施计划

- 制定时间：2026-11-01
- 依据：`docs/TechCompetitionHub_产品需求与工程实施方案.md` 第 13 章
- 执行范围：阶段 0–9，本地开发、检查、测试与构建；未经维护者明确批准不推送远程。

## 1. 阶段 0 仓库与 Git 检查结果

| 检查项                                            | 结果                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------- |
| 本地工作目录                                      | `D:\桌面\TechCompetitionHub`，初始仅含 `docs/`（PRD 与 Agent 约束） |
| 本地 Git                                          | 初始不是 Git 仓库；已执行 `git init -b main`                        |
| `TechCompetitionHub/TechCompetitionHub`           | 远程存在，`main` 为默认分支，仓库大小 0，无分支、无提交、无 Pages   |
| `TechCompetitionHub/TechCompetitionHub.github.io` | 远程存在，`main` 为默认分支，仓库大小 0，无分支、无提交、无 Pages   |
| GitHub 组织                                       | 2026-11-01 创建，2 个公开仓库，均未配置描述与许可证                 |
| Git 身份                                          | 本地已配置提交身份（不在文档记录个人信息）；SSH `github-scunf` 认证成功 |
| 工具链                                            | Node v24.17.0、npm 11.14.1、Git 2.47.1；未安装 GitHub CLI           |
| 结论                                              | 没有需要保留的既有代码；两个远程仓库均为空，不存在覆盖风险          |

部署目标决策：主仓库 `TechCompetitionHub` 作为源码与项目站点（`https://techcompetitionhub.github.io/TechCompetitionHub/`）。`TechCompetitionHub.github.io` 暂不写入；如后续需要根域名站点，可通过 `VITE_BASE_PATH=/` 复用同一构建产物。该决策记录于 `docs/ADR/0003-github-pages.md`，最终发布目标由维护者确认。

## 2. 技术方案

- React 19 + TypeScript 5.9 + Vite 7；Tailwind CSS 4；React Router 7（BrowserRouter + `404.html` 回退）。
- Zod 作为唯一运行时校验器，并生成 Draft 2020-12 JSON Schema 供外部编辑器和贡献者使用。
- 数据：`data/` 下逐条 JSON；内容：`content/guides/` 下 Markdown + YAML frontmatter。
- 领域逻辑：`src/lib/domain/` 纯函数（评分、排名、技能图、成长规划、搜索与筛选）。
- 数据访问：`src/services/` Repository 层统一读取、校验并暴露查询接口；页面不直接读取 JSON。
- 图表：首版不引入图表库，使用可访问的文本、进度条和表格，避免无意义装饰。
- 测试：Vitest + Testing Library + axe-core；数据校验与 Schema 漂移检查纳入 CI。
- 部署：GitHub Actions 构建后使用官方 Pages Actions 部署；PR 只检查不部署。

## 3. 分阶段实施与验收

### 阶段 1：工程骨架

- 交付：Vite/TS 工程、ESLint、Prettier、Vitest、Tailwind、路由、布局、错误边界、基础 CI、ADR、README 初稿。
- 检查：`format:check`、`lint`、`typecheck`、`test`、`build`。
- 验收：干净安装可启动；构建产物包含正确的 base path；PR 工作流不部署。

### 阶段 2：数据模型与可信数据

- 交付：Zod Schema + 生成 JSON Schema、词表、评分模型、10 条经官网核验的真实竞赛、技能/资源/路线数据、示例 fixture、校验脚本（重复 ID、URL、引用、循环、权重、状态）。
- 检查：上述工程检查 + `data:validate` + `data:schemas:check`。
- 验收：错误数据可被拦截；示例数据隔离；每条公开竞赛有来源、核验日期和状态；不以虚构数据补足数量。

### 阶段 3：竞赛目录与详情

- 交付：首页、竞赛目录、搜索/筛选/排序、URL 查询参数恢复、详情页、空状态/错误状态、深层链接。
- 检查：工程检查 + 路由集成测试 + 构建。
- 验收：筛选可分享；刷新详情页不 404；组件不硬编码竞赛事实。

### 阶段 4：评分与排行榜

- 交付：纯函数评分引擎、准入规则、缺失数据处理、并列规则、价值榜、评分方法页。
- 检查：评分/排名单元测试 + 工程检查。
- 验收：权重和为 1；未核验、未审核、缺维度条目不进入正式排名；结果可复现并显示模型版本与核验日期。

### 阶段 5：项目、经验、技能与社区

- 交付：项目目录/详情（真实空状态）、Markdown 指南、技能目录/详情、社区入口与投稿入口。
- 检查：工程检查 + 技能图测试 + 内容测试。
- 验收：技能依赖无环；任务有可验证验收标准；不编造项目或资源链接。

### 阶段 6：成长规划器

- 交付：目标选择、技能自评、依赖拓扑排序、缺口与阶段任务、验收标准、时间预算、Markdown 导出。
- 检查：规划器单元测试 + 集成测试 + 工程检查。
- 验收：无外部 API；无时间预算不生成精确日程；无资源时显示待补充；循环依赖可读报错。

### 阶段 7：社区治理与文档

- 交付：Discussions 指引、Issue/PR 模板、CONTRIBUTING、CODE_OF_CONDUCT、SECURITY、PRIVACY、CHANGELOG、RELEASE_CHECKLIST、ADR。
- 检查：工程检查 + 文档链接结构检查。
- 验收：贡献流程可执行；敏感信息与安全报告渠道明确。

### 阶段 8：质量收尾与部署

- 交付：移动导航、可访问性修正、SEO/Open Graph、sitemap、robots、404 回退、Pages 工作流、在线外链检查（非阻塞）。
- 检查：工程检查 + axe 自动化 + 生产预览冒烟。
- 验收：构建 base path 正确；PR 不部署；Actions 权限最小化。

### 阶段 9：最终审计

- 交付：按 PRD 第 14 章逐项审计、真实结果日志、已知限制、人工 GitHub 设置清单。
- 检查：`npm run check` 全量 + 生产构建预览 + 数据/评分抽查。
- 验收：不伪造完成状态；所有未完成项如实列出。

## 4. 数据可信度策略

1. 每条竞赛来自官方站点；记录 `sources[].url`、`accessed_at`、`supports`，并写入 `last_verified_at`。
2. 只核验官网可直接确认的事实（名称、主办方、官方入口、赛制/规模等）；报名时间、费用等无法确认时保持 `unknown` 并在页面显示“待核验”。
3. 评分为平台方法论下的编辑初评，页面明确标注“平台评分、非官方排名”；评分包含维度依据、证据等级、模型版本和复核状态。
4. 资料不足的条目不进入正式排行榜，单独列为“资料不足/待补充”。
5. 示例数据放在 `data/examples/`，`is_example: true`，不进入公开 Repository 与排行榜。

## 5. 风险与应对

| 风险                       | 应对                                                          |
| -------------------------- | ------------------------------------------------------------- |
| 官网不可访问导致无法核验   | 保留 `needs_review`，不冒充 `verified`；记录真实数量          |
| 评分主观性                 | 公开维度、权重、依据、证据等级与模型版本；限制正式排名准入    |
| 远程仓库为空、Pages 未启用 | 交付工作流与人工设置清单；不擅自推送或修改仓库设置            |
| 首次部署 404               | 生成 `404.html`、验证 base path、预览冒烟与路由集成测试       |
| 数据规模增长               | Repository 层隔离数据源；搜索纯函数；未来可替换为 API adapter |

## 6. 需要维护者确认的事项

1. 许可证：代码采用 MIT、原创文档采用 CC BY 4.0 是否符合预期（`LICENSE` 需最终确认）。
2. Pages 发布目标：项目站点或组织根站点（`TechCompetitionHub.github.io`）。
3. 是否授权将本地提交推送到远程；本计划默认不推送。
4. 评分初评需由维护者/领域评审复核后再对外宣传。
