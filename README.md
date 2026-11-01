# TechCompetitionHub

面向大学生的开源科技竞赛成长平台：可追溯的竞赛目录、可解释的价值评分、项目成果、技能图谱与规则式成长规划。

- 产品形态：GitHub Pages 静态站点 + GitHub Discussions
- 技术栈：React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + React Router 7
- 数据：仓库内 JSON，Zod 校验并生成 JSON Schema
- 社区：GitHub Issues / Pull Requests / Discussions
- 首版不部署后端、不使用数据库、不要求注册、不调用付费 API

> 平台不是竞赛主办方。评分为社区方法论下的编辑初评，不是官方排名、权威认证或对保研/就业结果的预测。竞赛事实以官方来源为准。

## 当前状态

本地 MVP 已实现并通过格式、Lint、类型、93 个测试、数据校验与生产构建。**尚未推送远程或部署**；GitHub Pages 工作流已就绪，发布设置需维护者完成。实际命令与结果见 [验证记录](docs/VERIFICATION_LOG.md)。

当前仓库真实数据（2026-11-01 核验）：

| 类型     | 数量 | 说明                                          |
| -------- | ---- | --------------------------------------------- |
| 竞赛     | 10   | 全部关键事实按官网核验，来源与访问日期可见    |
| 已评分   | 8    | 六维评分，平台编辑初评，待维护者/领域评审复核 |
| 正式排名 | 8    | 满足准入规则；2 条因未评分进入“资料不足”      |
| 技能     | 25   | L0–L4 行为描述、前置依赖、练习任务            |
| 学习资源 | 23   | 真实链接、访问条款与最后检查日期              |
| 路线模板 | 2    | 嵌入式、数据建模方向                          |
| 指南     | 4    | 选赛、复盘、可复现性、数据核验                |

项目成果目录当前为真实空状态：平台不使用示例项目冒充提交。

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

构建默认使用项目站点 base `/TechCompetitionHub/`；如需根域名站点：

```bash
VITE_BASE_PATH=/ npm run build
```

Windows PowerShell：

```powershell
$env:VITE_BASE_PATH='/'; npm run build
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

1. 将仓库推送到 `TechCompetitionHub/TechCompetitionHub` 的 `main` 分支（需维护者批准）。
2. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 推送 `main` 或手动运行 **Deploy GitHub Pages** 工作流。
4. 站点地址：`https://techcompetitionhub.github.io/TechCompetitionHub/`。
5. 工作流会先执行格式、Lint、类型、测试、数据校验与构建，再上传并部署。

`TechCompetitionHub.github.io` 组织站点仓库当前为空。若要用根域名 `https://techcompetitionhub.github.io/`，需要将源码放到该仓库，或以 `VITE_BASE_PATH=/` 构建并调整部署目标；两种方案见 [Pages 部署说明](docs/pages-deployment.md)。

PR 工作流只检查，不部署生产站点。部署工作流权限限制为 `contents: read`、`pages: write`、`id-token: write`。

## 贡献

请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 与 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。

- 新增竞赛 / 纠错 / 项目 / 技能资源：使用 `.github/ISSUE_TEMPLATE/` 中的模板。
- 数据改动：修改 `data/` 下 JSON，运行 `npm run data:validate` 与 `npm run data:schemas:check`。
- 代码改动：保持领域逻辑纯函数化，补充测试，不降低检查标准。
- 安全问题：按 [SECURITY.md](SECURITY.md) 私下报告，不要公开可利用细节。

## 已知限制

- 首版是 SPA，SEO 依赖静态 meta、sitemap 与 404 回退；没有预渲染每个详情页。
- 评分为编辑初评，未经过大规模评审；成本维度在缺少官方费用时使用保守估计。
- 竞赛数据的时效性依赖维护者复核；超过 18 个月未核验的条目不会进入正式排名。
- 项目成果与 Discussions 需要维护者在 GitHub 上启用/审核后才有内容。
- 首版没有账户、跨设备收藏、动态评分、后端审核后台或 AI 辅助。
- 部分竞赛官网仅提供前端渲染页面，链接检查以 HTTP 可访问性为准，不保证页面内容解析完整。

## 许可证

- 代码：MIT，见 [LICENSE](LICENSE)。
- 原创文档与内容：CC BY 4.0，见 [LICENSE-CONTENT.md](LICENSE-CONTENT.md)。
- 第三方材料遵循原许可证，不默认获得转载授权。

许可证选择已按 PRD 建议采用 MIT + CC BY 4.0，**最终需维护者确认**；如维护者选择其他许可证，请在合并前更新本段与许可证文件。

## 免责声明

TechCompetitionHub 是社区项目，与任何竞赛主办方无隶属关系。平台不提供报名、缴费、证书或获奖认证服务；不保证竞赛信息的永久准确性；不承诺获奖、保研或就业结果。使用前请回到官方来源核验。
