# TechCompetitionHub

面向大学生的开源科技竞赛成长平台：可追溯的竞赛目录、可解释的价值评分、项目成果、技能图谱与规则式成长规划。

- 产品形态：GitHub Pages 静态站点 + GitHub Discussions
- 技术栈：React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + React Router 7
- 数据：仓库内 JSON，Zod 校验并生成 JSON Schema
- 社区：GitHub Issues / Pull Requests / Discussions
- 首版不部署后端、不使用数据库、不要求注册、不调用付费 API

> 平台不是竞赛主办方。评分为社区方法论下的编辑初评，不是官方排名、权威认证或对保研/就业结果的预测。竞赛事实以官方来源为准。

## 当前状态

本地 MVP 已实现并通过格式、Lint、类型、117 个测试、数据校验与生产构建。源码已推送至 `TechCompetitionHub/TechCompetitionHub` 与根站点仓库 `TechCompetitionHub.github.io`；**主站点已通过 GitHub Actions 部署：`https://techcompetitionhub.github.io/`（2026-11-01）**，项目站点镜像也已部署到 `https://techcompetitionhub.github.io/TechCompetitionHub/`。Discussions 已启用；About 与分支保护由维护者继续设置。实际命令与结果见 [验证记录](docs/VERIFICATION_LOG.md)。

## 仓库关系

| 仓库                                              | 用途                               | 部署地址                                                   |
| ------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------- |
| `TechCompetitionHub/TechCompetitionHub`           | 源码、Issue、Discussions、项目站点 | `https://techcompetitionhub.github.io/TechCompetitionHub/` |
| `TechCompetitionHub/TechCompetitionHub.github.io` | 根站点发布镜像（同一提交）         | `https://techcompetitionhub.github.io/`                    |

同一提交推送到两个仓库。部署工作流按仓库名自动选择 base：根站点仓库使用 `/`，主仓库使用 `/TechCompetitionHub/`；两边的检查、构建与数据完全相同。

当前仓库真实数据（2026-11-01 核验）：

| 类型         | 数量 | 说明                                            |
| ------------ | ---- | ----------------------------------------------- |
| 竞赛         | 31   | 25 条已核验；6 条待核验（目录索引）             |
| 设备信息     | 31   | 11 无需设备 / 4 成品设备 / 12 自制设备 / 4 未知 |
| 已评分       | 8    | 六维评分，平台编辑初评，待维护者/领域评审复核   |
| 正式排名     | 8    | 满足准入规则；23 条因未评分进入“资料不足”       |
| 技能         | 30   | L0–L4 行为描述、前置依赖、练习任务              |
| 学习资源     | 23   | 真实链接、访问条款与最后检查日期                |
| 路线模板     | 2    | 嵌入式、数据建模方向                            |
| 指南         | 4    | 选赛、复盘、可复现性、数据核验                  |
| 含赛道信息   | 18   | 赛道/组别来自官网或当届通知                     |
| 外部目录引用 | 27   | 仅作检索线索，不参与评分                        |
| 社区评价     | 0    | 用户提交经审核后展示，不参与平台评分            |

> 部分条目记录高校常用的“A 类”竞赛目录引用。该目录/榜单只用于检索，不参与平台评分，也不代表认可度、技术含量或适合度；平台评分仍按六维模型、证据等级与核验日期独立评估。详见 [数据模型](docs/DATA_MODEL.md)。

论坛以 GitHub Discussions 承载；竞赛详情支持提交“参赛者自述评分”，必须填写是否参加过、赛道、年份、学校（可选）、角色与公开主页，经审核后才展示，且不进入平台评分或正式排名。项目成果目录当前为真实空状态：平台不使用示例项目冒充提交。

## 快速开始

要求 Node.js 22.12+、npm 10+。

```bash
npm ci
npm run dev
```

打开终端提示的本地地址（默认 `http://localhost:5173/`）。生产构建：

```bash
npm run build
npm run preview
```

构建默认使用根站点 base `/`。如需部署到项目站点（`/TechCompetitionHub/`）：

```bash
VITE_BASE_PATH=/TechCompetitionHub/ npm run build
```

Windows PowerShell：

```powershell
$env:VITE_BASE_PATH='/TechCompetitionHub/'; npm run build
```

本地预览根站点构建：

```bash
npm run preview
```

## 常用命令

| 命令                              | 作用                                                      |
| --------------------------------- | --------------------------------------------------------- |
| `npm run dev`                     | 本地开发服务器                                            |
| `npm run build`                   | 类型检查 + 生产构建 + 生成 404/sitemap/robots             |
| `npm run preview`                 | 预览生产构建                                              |
| `npm run format` / `format:check` | Prettier 写入 / 检查                                      |
| `npm run lint`                    | ESLint                                                    |
| `npm run typecheck`               | `tsc --noEmit`                                            |
| `npm test`                        | Vitest 单元与集成测试                                     |
| `npm run data:validate`           | Schema、重复 ID、引用、循环依赖、评分权重、日期与内容校验 |
| `npm run data:schemas`            | 从 Zod 生成 JSON Schema                                   |
| `npm run data:schemas:check`      | 检查生成的 Schema 是否漂移                                |
| `npm run links:check`             | 外部链接结构检查                                          |
| `npm run links:check:online`      | 外部链接在线检查（非阻塞）                                |
| `npm run check`                   | 依次执行格式、Lint、类型、测试、数据、Schema 与构建       |

## 目录结构

```text
.
├── content/guides/          # Markdown 经验文章（YAML frontmatter）
├── data/
│   ├── competitions/        # 竞赛 JSON，一条一个文件
│   ├── skills/              # 技能图谱
│   ├── resources/           # 学习资源
│   ├── roadmaps/            # 路线模板
│   ├── scoring-models/      # 版本化评分模型
│   ├── vocabularies/        # 受控词表
│   ├── examples/            # 明确标记的示例数据（不进入公开 Repository）
│   └── schemas/             # 由 Zod 生成的 JSON Schema
├── docs/                    # PRD、架构、数据模型、评分方法、ADR、检查清单
├── scripts/                 # 数据校验、Schema 生成、链接检查、postbuild
├── src/
│   ├── app/                 # 路由与根布局
│   ├── components/          # 设计系统与通用组件
│   ├── features/            # 领域 UI（竞赛、排行榜）
│   ├── lib/domain/          # 纯函数：Schema、评分、排名、技能图、规划、搜索
│   ├── pages/               # 路由页面
│   ├── services/            # Repository 层与站点配置
│   └── styles/              # Tailwind 主题与 Markdown 样式
├── tests/                   # 单元、集成与 fixture
└── .github/                 # CI、Pages 部署、Issue/PR 模板、Discussions 指引
```

页面不直接读取 JSON；数据统一经 `src/services/` 的 Repository 层加载与校验。评分、排名、技能依赖与路线生成均为 `src/lib/domain/` 下的纯函数。

## 数据可信度

- 每条公开竞赛包含稳定 ID、状态、来源、最后核验日期与更新时间。
- 状态：`draft`、`needs_review`、`verified`、`stale`、`rejected`。
- 未知日期/文本用 `null`，未知评分用 `scores: null`；禁止用 0 或 100 表示未知。
- `verified` 条目至少有一个 official/organizer/institutional 来源。
- 评分模型版本化，权重之和必须为 1；正式排名要求六个维度齐全、评分已审核、置信度至少 medium、核验时间在 18 个月内。
- 同分并列；资料不足的条目不进入正式排名，单独列出并说明原因。
- 示例数据在 `data/examples/`，`is_example: true`，不会被公开 Repository 或排行榜加载。

详见：

- [数据政策](docs/DATA_MODEL.md)
- [评分方法](docs/SCORING_METHODOLOGY.md)
- [架构说明](docs/ARCHITECTURE.md)
- [实施计划](docs/IMPLEMENTATION_PLAN.md)

## GitHub Pages 部署

### 根站点（主站点）

1. 将同一提交推送到 `TechCompetitionHub/TechCompetitionHub.github.io` 的 `main`。
2. 在该仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 推送 `main` 或手动运行 **Deploy GitHub Pages** 工作流。
4. 站点地址：`https://techcompetitionhub.github.io/`。

工作流检测到仓库名为 `TechCompetitionHub.github.io` 时自动使用 `VITE_BASE_PATH=/` 与 `SITE_URL=https://techcompetitionhub.github.io`。

### 项目站点（可选镜像）

`TechCompetitionHub/TechCompetitionHub` 使用同一工作流，检测到仓库名为 `TechCompetitionHub` 时自动使用 `VITE_BASE_PATH=/TechCompetitionHub/`，部署到 `https://techcompetitionhub.github.io/TechCompetitionHub/`。这不是主站，但可作为开发预览/备用入口。

### 同步两个仓库

```bash
git remote add root https://github.com/TechCompetitionHub/TechCompetitionHub.github.io.git
git push origin main
git push root main
```

本机已配置 `root`/SSH 身份时可直接推送到两个远程。根站点仓库必须命名为 `TechCompetitionHub.github.io`，否则 GitHub Pages 不会把它当作组织根站点。

工作流会先执行格式、Lint、类型、测试、数据校验与构建，再上传并部署。PR 工作流只检查，不部署生产站点；部署工作流权限限制为 `contents: read`、`pages: write`、`id-token: write`。

## 维护者仓库设置

首次发布时在 GitHub 仓库中完成以下设置；代码与工作流文件已经就绪：

- **About（根站点仓库）**：填写描述 `大学生科技竞赛开源成长平台：可追溯的数据、可解释的评分与规则式成长规划`，主页设为 `https://techcompetitionhub.github.io/`，添加 Topics：`competition`、`education`、`react`、`typescript`、`github-pages`、`open-data`。
- **Pages（根站点仓库）**：已自动启用并通过 GitHub Actions 成功部署（2026-11-01）。如迁移/重建，在 `TechCompetitionHub.github.io` 的 `Settings → Pages → Build and deployment → Source` 选择 **GitHub Actions**，再运行 `Deploy GitHub Pages`。
- **Pages（主仓库项目站点）**：已随主仓库 Deploy 工作流成功部署为镜像（`https://techcompetitionhub.github.io/TechCompetitionHub/`）。如重建，在 `TechCompetitionHub` 仓库同样选择 GitHub Actions。
- **Discussions（主仓库）**：在 `TechCompetitionHub` 的 `Settings → General → Features` 启用 Discussions，按 [.github/DISCUSSION_GUIDE.md](.github/DISCUSSION_GUIDE.md) 创建 8 个分类。站内只链接 Discussions 根地址。
- **Actions**：允许两个仓库运行 Actions；默认工作流权限设为只读，部署工作流已声明所需最小权限。
- **分支保护**：保护两个仓库的 `main`，要求 `CI / verify` 通过后再合并，禁止未审查的直接推送。
- **Issues（主仓库）**：确认 `.github/ISSUE_TEMPLATE/` 表单可用；按需创建 `data`、`bug`、`accessibility`、`documentation` 标签。
- **安全**：启用 Dependabot alerts 与 Security Advisories 私密报告；确认 `SECURITY.md` 中的渠道可访问。
- **许可证**：确认代码 MIT 与原创内容 CC BY 4.0；如更换许可证，先更新 `LICENSE` / `LICENSE-CONTENT.md` 与 README。

部署后至少检查：首页、目录、详情、排行榜、技能、规划器、指南、社区、404 可访问；直接刷新深层链接不白屏；移动端 375px 无横向溢出；键盘 Tab 顺序与焦点可见；`sitemap.xml` 包含主要路由。

## 贡献

请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 与 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。

- 新增竞赛 / 纠错 / 项目 / 技能资源：使用 `.github/ISSUE_TEMPLATE/` 中的模板，或使用站内“提交竞赛”生成 JSON 草稿。
- 参赛评价：使用“提交参赛评价”填写是否参加过、赛道、年份、学校（可选）、角色与公开主页，生成 Markdown 后通过 GitHub Issue 提交；审核后才展示。
- 论坛治理：分类边界、处理阶梯、评价审核与申诉见 [COMMUNITY_MODERATION.md](docs/COMMUNITY_MODERATION.md)。
- 数据改动：修改 `data/` 下 JSON，运行 `npm run data:validate` 与 `npm run data:schemas:check`。
- 代码改动：保持领域逻辑纯函数化，补充测试，不降低检查标准。
- 安全问题：按 [SECURITY.md](SECURITY.md) 私下报告，不要公开可利用细节。

## 已知限制

- 首版是 SPA，SEO 依赖静态 meta、sitemap 与 404 回退；没有预渲染每个详情页。
- 评分为编辑初评，未经过大规模评审；成本维度在缺少官方费用时使用保守估计。
- 竞赛数据的时效性依赖维护者复核；超过 18 个月未核验的条目不会进入正式排名。
- 项目成果与 Discussions 需要维护者在 GitHub 上启用/审核后才有内容。
- 首版没有账户、跨设备收藏、动态评分、后端审核后台或 AI 辅助。
- 排行榜目前只实现 P0 要求的**竞赛价值榜**；项目成果榜、技能路线/资源榜、成长案例展示尚未实现。
- 根站点与项目站点镜像均已部署，并验证首页、静态资源、`404.html` 与深层链接回退；深层链接按 GitHub Pages 规则返回 HTTP 404，但由 SPA 正常渲染。
- 根站点仓库与主仓库目前需要手动同步推送；未配置自动镜像或跨仓库部署令牌。
- 外部链接在线检查为每周非阻塞任务，受网络环境影响时以人工复核为准。
- 部分竞赛官网仅提供前端渲染页面，链接检查以 HTTP 可访问性为准，不保证页面内容解析完整。

## 许可证

- 代码：MIT，见 [LICENSE](LICENSE)。
- 原创文档与内容：CC BY 4.0，见 [LICENSE-CONTENT.md](LICENSE-CONTENT.md)。
- 第三方材料遵循原许可证，不默认获得转载授权。
- 论坛头像由维护者设计，优化版本位于 `public/forum-avatar.jpg`；随项目展示，第三方使用需遵守上述许可并保留出处。

许可证选择已按 PRD 建议采用 MIT + CC BY 4.0，**最终需维护者确认**；如维护者选择其他许可证，请在合并前更新本段与许可证文件。

## 免责声明

TechCompetitionHub 是社区项目，与任何竞赛主办方无隶属关系。平台不提供报名、缴费、证书或获奖认证服务；不保证竞赛信息的永久准确性；不承诺获奖、保研或就业结果。使用前请回到官方来源核验。
