# 验证记录

- 日期：2026-11-01（Asia/Shanghai）
- 环境：Windows 11、Node v24.17.0、npm 11.14.1、Git 2.47.1
- 提交状态：本地仓库，尚未推送远程或部署
- 说明：本文件只记录实际运行的命令与结果；没有运行的检查不会被写成“通过”。

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

| 步骤   | 命令                         | 结果                                                                   |
| ------ | ---------------------------- | ---------------------------------------------------------------------- |
| 格式   | `npm run format:check`       | 通过                                                                   |
| Lint   | `npm run lint`               | 通过，0 error                                                          |
| 类型   | `npm run typecheck`          | 通过                                                                   |
| 测试   | `npm test`                   | 9 个文件、93 个测试全部通过（含 16 条路由 axe 审计）                   |
| 数据   | `npm run data:validate`      | 10 竞赛 / 25 技能 / 23 资源 / 2 路线 / 1 模型 / 4 文章；0 错误、0 警告 |
| Schema | `npm run data:schemas:check` | 8 个 JSON Schema 与 Zod 定义一致                                       |
| 构建   | `npm run build`              | 通过                                                                   |

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

- 10 条竞赛全部 `verified`，`last_verified_at = 2026-11-01`，至少一个 official 来源。
- 8 条有平台评分并满足正式排名准入；2 条（蓝桥杯、智能汽车）无评分，进入“资料不足”。
- 全国大学生数学建模竞赛：82/90/85/88/90/55，按 0.25/0.20/0.20/0.15/0.15/0.05 计算 = 84.95。
- RoboMaster：92/86/94/92/92/30 = 88.10。
- 技能图无环、无缺失前置；25 个技能均有 L0–L4 与至少一个带验收标准的任务。
- 示例数据 `data/examples/` 均为 `is_example: true`，不进入公开 Repository 或排行榜。

## 8. 未完成或未验证

- 未推送远程；GitHub Pages 真实部署未验证。
- 未在真实手机/浏览器上做人工视觉与键盘走查；已有自动化 axe 与响应式布局检查。
- 首版 8 条评分尚未由维护者/领域评审人工复核。
- 外部链接在线检查受本机网络影响，未在 CI 环境运行。
- 项目成果目录为真实空状态，未做项目提交演练。
- Discussions 未启用；Issue 模板与分类指引已提交，需仓库设置。
- 许可证最终选择需维护者确认。
