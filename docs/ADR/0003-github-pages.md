# ADR 0003：GitHub Pages 部署与路由回退

- 状态：已采纳（发布目标待维护者确认）
- 日期：2026-11-01

## 背景

组织下有两个空仓库：

- `TechCompetitionHub/TechCompetitionHub`（推荐作为源码 + 项目站点）
- `TechCompetitionHub/TechCompetitionHub.github.io`（组织根站点）

GitHub Pages 是静态托管，不支持 SPA rewrites；项目站点 URL 带仓库路径，Vite 必须配置 `base`。

## 决策

1. 源码与站点部署放在 `TechCompetitionHub/TechCompetitionHub`。
2. 生产 `base` 默认 `/TechCompetitionHub/`，可通过 `VITE_BASE_PATH` 覆盖为 `/`。
3. 使用 `BrowserRouter` + basename；构建后复制 `index.html` 为 `404.html`，作为深层链接回退。
4. 生成 `.nojekyll`、`sitemap.xml`、`robots.txt`。
5. 使用官方 Pages Actions（`configure-pages`、`upload-pages-artifact`、`deploy-pages`）部署。
6. 组织根站点暂不写入；如需要，按 `docs/pages-deployment.md` 的方案 A/B 处理。

## 备选方案

- **HashRouter**：无需 404 回退，但 URL 含 `#`，不利于 SEO 与分享。
- **预渲染每个路由**：SEO 更好，但首版增加构建复杂度；当前 SPA + sitemap 可接受。
- **跨仓库部署到 `.github.io`**：需要 PAT 与额外权限，违反“最小密钥”原则；暂不采用。

## 后果

- 项目站点可直接使用；根域名需维护者选择方案。
- 深层链接刷新可用，但 HTTP 状态为 404（Pages 限制）。
- 404 页面与首页内容相同；可用 `usePageMeta` 设置 noindex，但无法改变 HTTP 状态。
- 若未来迁移到自定义域名或根站点，只需调整 `VITE_BASE_PATH` 与 `SITE_URL`。
