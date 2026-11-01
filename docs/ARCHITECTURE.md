# 架构说明

- 状态：MVP（0.1.0）
- 最后更新：2026-11-01
- 相关 ADR：`docs/ADR/`

## 1. 目标与约束

TechCompetitionHub 首版是静态站点，目标是：

1. 内容与展示分离，页面不硬编码竞赛事实。
2. 评分、排序、技能差距与路线生成是纯函数，可测试、可复现。
3. 数据校验前置，错误数据在 CI 与构建阶段失败。
4. 不部署后端、数据库或付费 API；未来可平滑替换数据源。
5. 贡献门槛低：JSON + Markdown + PR。

主要约束：GitHub Pages 只托管静态文件，不能运行 Node/Python 服务端；项目站点 URL 带仓库路径，必须正确配置 `base`；深层路由刷新需要 `404.html` 回退。

## 2. 技术栈

| 层       | 选择                                | 说明                                            |
| -------- | ----------------------------------- | ----------------------------------------------- |
| 构建     | Vite 7                              | 静态构建、开发服务器、资源哈希                  |
| UI       | React 19 + TypeScript 5.9           | 组件化、严格类型                                |
| 路由     | React Router 7                      | BrowserRouter + base + 404 回退                 |
| 样式     | Tailwind CSS 4                      | 设计 token、响应式、无运行时 CSS-in-JS          |
| 数据校验 | Zod 4                               | 运行时校验 + TypeScript 类型 + 生成 JSON Schema |
| Markdown | react-markdown + remark-gfm         | 不启用原始 HTML，降低 XSS 风险                  |
| 测试     | Vitest + Testing Library + axe-core | 单元、集成、基础可访问性                        |
| CI/CD    | GitHub Actions                      | PR 检查、Pages 部署、定期外链检查               |
| 托管     | GitHub Pages                        | 公共仓库免费静态托管                            |
| 社区     | GitHub Discussions                  | 不自建论坛                                      |

不使用 Redux、微前端、服务网格、Turborepo/Nx 或多个校验库。

## 3. 分层

```text
页面 (src/pages)
  ↓ 只调用 service / 展示组件
Repository / Service (src/services)
  ↓ 加载并校验数据，调用纯函数
领域逻辑 (src/lib/domain)
  ↓ 不依赖 React / DOM
数据文件 (data/) + 内容 (content/)
```

- **页面**：路由级组件，负责布局、交互与状态；不直接 `import` JSON。
- **Service**：`dataSource.ts` 用 `import.meta.glob` 加载 JSON/Markdown，经 Zod 校验后建立索引；其他 service 暴露查询接口（列表、详情、关联、评分、规划目标）。
- **领域逻辑**：`schemas.ts`、`scoring.ts`、`ranking.ts`、`skillGraph.ts`、`roadmap.ts`、`search.ts`、`validateDataset.ts`。
- **数据**：`data/` 下逐条 JSON；`content/guides/` 下 Markdown + YAML frontmatter。

未来接入后端时，保持 `CompetitionRepository` 等 service 接口不变，替换 `dataSource` 为 API adapter。

## 4. 路由与 GitHub Pages

路由（BrowserRouter）：

```text
/                         首页
/competitions             竞赛目录（q, domain, audience, difficulty, format, cost, status, sort）
/competitions/:id         竞赛详情
/rankings                 价值榜（domain）
/projects                 项目目录
/projects/:id             项目详情
/skills                   技能图谱（domain）
/skills/:id               技能详情
/planner                  成长规划（target）
/guides                   经验指南
/guides/:slug             文章详情
/community                社区入口
/about /contribute /data-policy /scoring-method /privacy
*                         404
```

- `base`：开发为 `/`，生产默认 `/TechCompetitionHub/`；可用 `VITE_BASE_PATH` 覆盖。
- `BrowserRouter basename` 从 `import.meta.env.BASE_URL` 推导。
- 构建后 `scripts/postbuild.ts` 将 `index.html` 复制为 `404.html`。GitHub Pages 对未知路径返回 404 页面，React Router 再按当前 URL 渲染；因此深层链接刷新不会白屏。
- `.nojekyll` 防止 GitHub Pages 的 Jekyll 处理。
- `sitemap.xml` 从静态路由与数据条目生成；`robots.txt` 指向 sitemap。
- 相对资源路径由 Vite 的 `base` 处理，禁止硬编码 `/assets/...`。

## 5. 数据流

1. 构建/运行时，`dataSource.ts` 的 `import.meta.glob` 收集 `data/**/*.json`。
2. `parseRecords` 用对应 Zod Schema 校验；失败时抛出包含文件路径与字段错误的异常。
3. 过滤 `is_example`、`rejected`，按名称排序并建立 `Map` 索引。
4. Markdown 内容用 `parseContentFile` 解析 frontmatter 与正文；草稿不加载。
5. 页面通过 service 获取数据；筛选、评分、排名、规划在纯函数中完成。
6. CI 中的 `scripts/validate-data.ts` 读取同一批文件，执行更完整的跨记录校验；构建只在数据可解析时成功。

## 6. 评分与排名

- 评分模型是 `data/scoring-models/competition-value-1.0.0.json`，版本化、权重和为 1。
- `evaluateCompetitionScore` 检查数据状态、核验时效、评分版本、复核状态、置信度、维度覆盖。
- 未知维度不记为 0/100；部分维度只产生“暂定分”，不进入正式排名。
- `rankCompetitions` 仅对 `official` 条目排名；同分共享名次，下一名次跳过；`excluded` 保留原因与暂定分。
- 页面展示模型版本、维度依据、证据等级、覆盖率、核验日期与免责声明。

## 7. 技能图与成长规划

- 技能依赖用 DFS 检测环，Kahn 拓扑排序生成确定性顺序；缺失前置技能进入 `missing`。
- 规划器展开目标技能的前置依赖，计算 `gap = max(0, target - current)`；`current` 来自用户自评。
- 阶段按计划内依赖深度分组；任务来自技能练习任务，必须有产出物与验收标准。
- 只有提供每周小时数且所有任务有可靠工时估算时才生成周次；否则只给阶段顺序。
- 无资源时显示“待补充”，不生成虚构 URL。
- Markdown 导出包含前提、限制、风险提示与自评声明。

## 8. 构建与部署

`npm run build` 执行：

1. `tsc --noEmit`
2. `vite build`（base、资源哈希、CSS 提取）
3. `tsx scripts/postbuild.ts`：校验 base、生成 `404.html`、`.nojekyll`、`sitemap.xml`、`robots.txt`

CI（`.github/workflows/ci.yml`）在 PR 上执行格式、Lint、类型、测试、数据校验、Schema 漂移检查与构建，不部署。`deploy-pages.yml` 在 `main` push 或手动触发时执行同一套检查后使用官方 Pages Actions 部署。`link-check.yml` 每周运行外部链接检查，不阻断 PR。

## 9. 性能与可访问性

- 首屏不依赖第三方 API；无外部字体/分析脚本。
- 数据规模为数十到数百条，客户端过滤足够；搜索为纯函数，避免每次渲染重复建索引（页面用 `useMemo`）。
- 图表不引入库；评分用文本 + `role="meter"` + 表格，避免装饰性图表。
- 语义化 landmark、跳过链接、可见焦点、键盘可操作的移动菜单、`aria-live` 结果计数、状态不只靠颜色。
- 图片仅 favicon；内容页无大图，避免 LCP 问题。

## 10. 安全与隐私

- 无账户、无 Cookie、无第三方分析。
- Markdown 不启用 `rehype-raw`，不渲染原始 HTML。
- 外链 `target="_blank" rel="noopener noreferrer"`。
- Actions 最小权限；PR 工作流 `contents: read`。
- 不提交 `.env`、密钥或个人数据；`SECURITY.md` 提供私密报告渠道。

## 11. 已知架构限制

- SPA 没有逐页预渲染；SEO 依赖静态 meta、sitemap 与社交分享基础字段。
- 运行时不重新校验数据（构建/测试阶段校验）；若未来支持运行时远程数据，需要加入缓存与错误边界策略。
- 评分与技能数据规模增长后，`import.meta.glob` 全量加载可能需要改为构建期索引或 API。
- 项目与 Discussions 的审核依赖 GitHub 权限，没有站内管理后台。

## 12. 未来后端迁移

触发条件：跨设备档案、动态评分、数据量/审核流程超出 PR 管理、细粒度权限、通知或私密数据。

迁移步骤：

1. 冻结并版本化公共数据 Schema。
2. 定义 `CompetitionRepository`、`ProjectRepository`、`SkillRepository` 等接口（当前 service 已接近该边界）。
3. 保留静态 JSON adapter 作为回退。
4. 新增 API adapter，业务服务层不变。
5. 公共事实迁移到 PostgreSQL，保留来源与历史。
6. 动态评分与审核记录单独存储，加入限频、去重、反刷与申诉。
7. 身份提供商（如 GitHub OAuth）的回调与会话由后端处理，浏览器不持有服务端密钥。
