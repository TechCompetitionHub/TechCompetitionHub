# 验证记录

- 日期：2026-11-01（Asia/Shanghai）
- 环境：Windows 11、Node v24.17.0、npm 11.14.1、Git 2.47.1
- 提交状态：已推送主仓库与根站点仓库的 `main`；根站点已部署（2026-11-01），最新提交以远程 HEAD 为准
- 说明：本文件只记录实际运行的命令与结果；没有运行的检查不会被写成“通过”。
- 2026-11-01 更新：主站改为根站点 `TechCompetitionHub.github.io`（base `/`）。第 3–5 节保留迁移前项目站点验证记录；第 9 节为当前根站点验证。

## 1. 干净安装

```text
npm ci --registry=https://registry.npmjs.org --no-audit --no-fund
added 386 packages in 16s
```

安装警告（不影响构建）：

- `whatwg-encoding@3.1.1` 为 jsdom 传递依赖，已弃用提示。
- `@testing-library/jest-dom@6.10.0` 上游标记为错误的小版本发布；当前测试通过，升级需单独验证。
- `eslint@9.39.5` 上游提示该 9.x 版本已停止支持；升级到 ESLint 10 需要网络与配置回归，首版保持当前锁定版本。

## 2. 全量检查

命令：

```bash
npm run check
```

结果：`exit=0`。

包含：

| 步骤   | 命令                         | 结果                                                                                |
| ------ | ---------------------------- | ----------------------------------------------------------------------------------- |
| 格式   | `npm run format:check`       | 通过                                                                                |
| Lint   | `npm run lint`               | 通过，0 error                                                                       |
| 类型   | `npm run typecheck`          | 通过                                                                                |
| 测试   | `npm test`                   | 10 个文件、117 个测试全部通过（含 23 条路由 axe 审计）                              |
| 数据   | `npm run data:validate`      | 31 竞赛 / 30 技能 / 23 资源 / 2 路线 / 1 模型 / 4 文章 / 0 社区评价；0 错误、0 警告 |
| Schema | `npm run data:schemas:check` | 9 个 JSON Schema 与 Zod 定义一致                                                    |
| 构建   | `npm run build`              | 通过                                                                                |

测试明细：

```text
✓ tests/unit/scoring.test.ts (13)
✓ tests/unit/ranking.test.ts (5)
✓ tests/unit/scoring-model.test.ts (1)
✓ tests/unit/content.test.ts (5)
✓ tests/unit/roadmap.test.ts (8)
✓ tests/unit/skill-graph.test.ts (8)
✓ tests/unit/search.test.ts (10)
✓ tests/unit/data-validation.test.ts (14)
✓ tests/integration/app.test.tsx (29)
Test Files  9 passed (9)
Tests       93 passed (93)
```

集成测试覆盖：首页、目录筛选与 URL 状态、空状态、详情深层链接、404、排行榜准入与排除、技能详情、成长规划器、Markdown 文章按需加载、移动导航键盘关闭、社区链接约束；并对 16 条主要路由逐一执行 axe-core 基础可访问性审计（关闭仅依赖布局的 color-contrast 规则）。

## 3. 生产构建

```text
vite v7.3.7 building client environment for production...
✓ 589 modules transformed.
dist/index.html                            1.10 kB │ gzip:   0.59 kB
dist/assets/index-Ce1RVKu1.css            39.07 kB │ gzip:   7.01 kB
dist/assets/vendor-react-ker38TCy.js      50.53 kB │ gzip:  17.88 kB
dist/assets/vendor-zod-kdM93vdI.js        92.28 kB │ gzip:  26.19 kB
dist/assets/GuideDetailPage-B6oIN5hv.js  167.85 kB │ gzip:  51.49 kB
dist/assets/index-DUJE_cwx.js            625.29 kB │ gzip: 190.10 kB
✓ built in 2.90s
postbuild：404.html、.nojekyll、sitemap.xml（52 个 URL）、robots.txt 已生成并校验；base=/TechCompetitionHub/
```

postbuild 校验：base 路径、`404.html` 与 `index.html` 一致、sitemap 含竞赛详情、robots 指向 sitemap、数据非空。

## 4. 生产预览冒烟

启动 `npm run preview -- --host 127.0.0.1 --port 4173`，实际 HTTP 结果：

| URL                                                                   | 状态 | 结果                            |
| --------------------------------------------------------------------- | ---- | ------------------------------- |
| `/TechCompetitionHub/`                                                | 200  | HTML，含 `id="root"`            |
| `/TechCompetitionHub/competitions/cumcm`                              | 200  | SPA 回退 HTML                   |
| `/TechCompetitionHub/404.html`                                        | 200  | 与 `index.html` 内容一致        |
| `/TechCompetitionHub/sitemap.xml`                                     | 200  | 包含 10 条竞赛详情 URL          |
| `/TechCompetitionHub/robots.txt`                                      | 200  | 指向 sitemap                    |
| 主 JS 资源（`/TechCompetitionHub/assets/index-*.js`，以构建引用为准） | 200  | 625,286 bytes（哈希随构建变化） |

> Vite preview 对未知路径返回 200 SPA 回退；GitHub Pages 会返回 404 + `404.html`，两者都依赖同一份 React 路由。真实 Pages 行为尚未部署验证。

## 5. 根域名 base 构建

命令：

```powershell
$env:VITE_BASE_PATH='/'
$env:SITE_URL='https://techcompetitionhub.github.io'
npm run build
```

结果：

- `dist/index.html` 资源为 `/assets/...`；
- sitemap 首页为 `https://techcompetitionhub.github.io/`；
- postbuild 通过，`base=/`。

随后已恢复默认项目站点构建（`base=/TechCompetitionHub/`）。

## 6. 链接检查

结构检查：

```text
npm run links:check
发现 48 个外部链接（86 处引用）。
```

在线检查：

```text
npm run links:check:online
44 个链接在 Node fetch 下返回 2xx；4 个报 fetch failed
```

4 个 Node fetch 失败链接在 PowerShell `Invoke-WebRequest` 下均返回 200：

- `https://www.crypto101.io/`（200，5,613 bytes）
- `https://python-control.readthedocs.io/`（200，14,839 bytes）
- `https://pytorch.org/tutorials/`（200，222,728 bytes）
- `https://docs.python.org/zh-cn/3/tutorial/`（200，37,585 bytes）

结论：链接本身可访问；失败来自本机 Node/网络栈的超时或 TLS 行为。在线检查在 CI 中是非阻塞的每周任务，不阻断 PR。

## 7. 数据与评分抽查

- 31 条竞赛中 25 条 `verified`、6 条 `needs_review`（百度之星、机械创新设计、电子设计、华为 ICT、CCPC、中国高校智能机器人创意大赛）；所有 verified 条目至少一个 official 来源。
- 8 条有平台评分并满足正式排名准入；23 条无评分，进入“资料不足”。
- 27 条竞赛带外部目录引用（高校常用“A 类”84 项目录），该字段不参与评分与排名；RoboMaster、MCM/ICM、CCPC 未引用该目录。
- 18 条竞赛带结构化赛道/组别；其余保持空数组并标注待补充。
- 31 条竞赛带设备信息：11 无需设备、4 成品设备、12 自制设备、4 未知；成品/自制设备含简介，自制设备含要求。
- 社区参赛评价公开数据为 0 条；不使用示例评价填充。
- 全国大学生数学建模竞赛：82/90/85/88/90/55，按 0.25/0.20/0.20/0.15/0.15/0.05 计算 = 84.95。
- RoboMaster：92/86/94/92/92/30 = 88.10。
- 技能图无环、无缺失前置；30 个技能均有 L0–L4 与至少一个带验收标准的任务。
- 示例数据 `data/examples/` 均为 `is_example: true`，不进入公开 Repository 或排行榜。

## 8. 未完成或未验证

- 根站点与项目站点镜像均已部署，并完成首页、资源、404.html 与深层链接回退验证。
- 未在真实手机/浏览器上做人工视觉与键盘走查；已有自动化 axe 与响应式布局检查。
- 首版 8 条评分尚未由维护者/领域评审人工复核。
- 外部链接在线检查受本机网络影响，未在 CI 环境运行。
- 项目成果目录为真实空状态，未做项目提交演练。
- Discussions 未启用；Issue 模板与分类指引已提交，需仓库设置。
- 许可证最终选择需维护者确认。

## 9. 根站点（当前主站）验证

根站点发布目标：`TechCompetitionHub/TechCompetitionHub.github.io` → `https://techcompetitionhub.github.io/`。

- 默认生产构建 base 改为 `/`；项目站点使用 `VITE_BASE_PATH=/TechCompetitionHub/` 覆盖。
- `npm run check`：exit 0；93 个测试、数据校验 0 错误 0 警告、Schema 8 个一致。
- 根站点构建：

```text
dist/index.html                            1.00 kB │ gzip:   0.58 kB
dist/assets/index-Ce1RVKu1.css            39.07 kB │ gzip:   7.01 kB
dist/assets/vendor-react-ker38TCy.js      50.53 kB │ gzip:  17.88 kB
dist/assets/vendor-zod-kdM93vdI.js        92.28 kB │ gzip:  26.19 kB
dist/assets/GuideDetailPage-DrprvxZs.js  167.85 kB │ gzip:  51.49 kB
dist/assets/index-BC7yxjMV.js            625.21 kB │ gzip: 190.07 kB
postbuild：... base=/
```

- `dist/index.html` 资源为 `/assets/...`；sitemap 首页为 `https://techcompetitionhub.github.io/`，包含 10 条竞赛详情 URL。
- 根站点预览：`/`、`/competitions/cumcm`、`/404.html`、主 JS、`/sitemap.xml` 均返回 200；主 JS 625,208 bytes。
- 项目站点覆盖构建：`VITE_BASE_PATH=/TechCompetitionHub/` 时资源为 `/TechCompetitionHub/assets/...`，postbuild 通过；随后已恢复根站点构建。
- 根站点 Pages 已由 GitHub Actions 成功部署（2026-11-01）。线上检查：首页 200、主 JS 200、`404.html` 200、`/competitions/cumcm` 返回 HTTP 404 但由 SPA 回退渲染、sitemap 含 10 条竞赛 URL、robots 指向 sitemap。
- 项目站点镜像已由主仓库 Actions 部署成功：`https://techcompetitionhub.github.io/TechCompetitionHub/` 返回 200，sitemap 主机为 `https://techcompetitionhub.github.io/TechCompetitionHub/`，深层链接同样由 `404.html` 回退。
- 部署时发现 `GITHUB_REPOSITORY_OWNER` 为大小写混合，sitemap/robots 曾生成 `https://TechCompetitionHub.github.io/`；工作流已改为小写 owner，重新部署后以 `https://techcompetitionhub.github.io/` 为准。

## 10. 竞赛目录扩展与 Discussions 接入

- 新增 3 条经官网核验的竞赛：中国国际大学生创新大赛、全国大学生市场调查与分析大赛、全国大学生嵌入式芯片与系统设计竞赛；全部 `verified`、`scores: null`，不进入正式排名。
- 竞赛总数 13（当次），已评分 8，正式排名 8，资料不足 5；后续扩展到 21 条见第 11 节。
- 新增 `external_lists` 字段；12 条竞赛引用高校常用“A 类”84 项目录（RoboMaster 未引用）。目录仅作检索线索，不参与评分；详情页显示“外部竞赛目录（不参与评分）”与免责声明。
- 数据校验：13 竞赛 / 25 技能 / 23 资源 / 2 路线 / 1 模型 / 4 文章；0 错误 0 警告。
- Discussions 已启用；社区页链接实际默认分类：Announcements、Q&A、Show and tell、General、Ideas、Polls。
- 测试仍为 93 个，全部通过；`npm run check` exit 0。
- 构建：593 modules，sitemap 55 个 URL（13 竞赛 + 25 技能 + 4 文章 + 13 静态路由），base `/`。
- 推送提交 `42f3fbc` 后，根站点与项目站点 Deploy 均成功；线上 sitemap 均包含 13 条竞赛 URL，并包含 3 个新竞赛 ID。

## 11. 论坛、竞赛扩展与用户评分

- 新增 8 条竞赛：ROBOCON、中国机器人大赛暨 RoboCup 机器人世界杯中国赛、“中国软件杯”、中国大学生机械工程创新创意大赛、百度之星、全国大学生机械创新设计大赛、全国大学生电子设计竞赛、华为 ICT 大赛。
- 新增 10 条竞赛（ACM-ICPC、MCM/ICM、西门子杯、CCPC、睿抗、中国高校智能机器人创意大赛、中国机器人及人工智能大赛、物联网设计、算法精英、ROBOTAC）与 5 个技能（ROS 2、机器人仿真、文档与 PPT、LaTeX、论文撰写）。
- 竞赛总数 31：25 条 verified、6 条 needs_review；8 条已评分，23 条资料不足；27 条带外部目录引用；18 条带结构化赛道。
- 新增 `community-review` Schema、`data/reviews/` 与 `data/reviews/README.md`；公开评价为 0，不使用示例评价。
- 新增 `/submit-review`：要求填写是否参加过、赛道、年份、学校（可选）、角色、公开主页、证据链接与公开同意；生成 Markdown 并通过 GitHub Issue 提交，审核后才展示。
- 竞赛详情新增“参赛者自述评分”区块：无评价时显示空状态；有审核评价时显示平均分、样本量、分布与公开背景。社区评分不参与平台六维评分或正式排名。
- 新增 `/submit-competition`：生成 `needs_review`、`scores: null` 的竞赛 JSON 草稿，支持复制/下载，不保存表单内容。
- 新增 `/categories` 与 `/categories/:domainId`：按机器人、嵌入式、电子设计、机械与工程、软件、创新创业等 12 个受控类别浏览，展示收录、核验与评分数量；首页类别按收录数量排序。
- 新增 `/forum` 与 6 个 `/forum/:slug` 分类页：分类边界、适用/不适用内容、发帖模板、相关站内入口与 GitHub 直达；社区页增加论坛搜索。
- 新增 `docs/COMMUNITY_MODERATION.md`：处理阶梯、参赛评价审核、数据纠错分工与申诉。
- 论坛分类详情页与类别页按需加载，主包从约 711 KB 降到约 697 KB，构建不再出现 700 KB 警告。
- 视觉与动效：首页渐变网格/光晕、渐变标题、卡片悬浮抬升、页面进入过渡、顶部路由进度条、懒加载页面骨架屏与 shimmer、CSS 滚动进度条、Header 滚动阴影与导航高光；分类卡片错峰进入。全部为 CSS/原生 React，并提供 `prefers-reduced-motion` 降级。
- 视觉检查：Chrome 1440×1200 桌面与 CDP 390×844 移动视口截图；移动端 `scrollWidth = innerWidth = 390`，无横向溢出。
- 论坛头像采用维护者设计的原图，优化为 `public/forum-avatar.jpg`（512×512，约 42 KB），用于页头与社区页；README 已记录出处与许可提示。
- Discussions 当前默认 6 个分类，社区页链接实际分类。
- 竞赛详情新增 1–5 星评分入口，选择后跳转 `/submit-review` 并预填评分；已审核的他人评价继续显示平均分、分布与背景信息。
- 价值榜改为“前三名高低领奖台 + 第 4 名起列表”；桌面 1440×1200 与 CDP 390×844 移动视口已检查，移动端无横向溢出。
- 竞赛数据新增 `equipment` 对象；31 条竞赛全部补全，并在卡片、详情与目录筛选中展示。
- 测试：10 个文件、117 个测试全部通过；`npm run check` exit 0。
- 构建：629 modules，sitemap 100 个 URL（31 竞赛 + 30 技能 + 4 文章 + 17 静态路由 + 12 类别 + 6 论坛分类），CSS 59.00 KB；数据 JSON 拆为 `catalog-data`（约 220 KB），应用主包约 309.34 KB，vendor 分块独立。
- 懒加载：论坛分类、竞赛类别、类别详情、文章详情、提交竞赛与提交评价均按需加载；骨架屏在 Suspense 期间显示。
- 推送提交 `0f0f4d5` 后，根站点与项目站点 Deploy 均成功；线上主 JS 309,337 bytes、数据 chunk 219,689 bytes，均包含设备要求；`/rankings` 与竞赛详情由 `404.html` 回退渲染。
