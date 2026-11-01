# ADR 0003：GitHub Pages 部署与路由回退

- 状态：已采纳（根站点为主，项目站点为可选镜像）
- 日期：2026-11-01

## 背景

组织下有两个仓库：

- `TechCompetitionHub/TechCompetitionHub`：源码、Issue、Discussions，可部署项目站点。
- `TechCompetitionHub/TechCompetitionHub.github.io`：组织根站点仓库，发布 `https://techcompetitionhub.github.io/`。

GitHub Pages 是静态托管，不支持 SPA rewrites；根站点 base 为 `/`，项目站点 base 为 `/TechCompetitionHub/`，Vite 必须正确配置。

## 决策

1. 主站点使用根站点仓库 `TechCompetitionHub.github.io`，地址 `https://techcompetitionhub.github.io/`。
2. 源码保留在主仓库 `TechCompetitionHub/TechCompetitionHub`；同一提交镜像推送到根站点仓库。
3. 生产 `base` 默认 `/`；项目站点通过 `VITE_BASE_PATH=/TechCompetitionHub/` 覆盖。
4. 部署工作流按仓库名自动选择 base 与 `SITE_URL`，两个仓库共用同一工作流。
5. 使用 `BrowserRouter` + basename；构建后复制 `index.html` 为 `404.html`，作为深层链接回退。
6. 生成 `.nojekyll`、`sitemap.xml`、`robots.txt`。
7. 使用官方 Pages Actions（`configure-pages`、`upload-pages-artifact`、`deploy-pages`）部署。

## 备选方案

- **仅项目站点**：URL 带 `/TechCompetitionHub/`，不是根域名；可作为备用入口，但不是主入口。
- **HashRouter**：无需 404 回退，但 URL 含 `#`，不利于 SEO 与分享。
- **预渲染每个路由**：SEO 更好，但首版增加构建复杂度；当前 SPA + sitemap 可接受。
- **跨仓库部署（主仓库构建后推送到 `.github.io`）**：需要 PAT 与额外权限，违反“最小密钥”原则；改用同一提交手动/CI 镜像推送。

## 后果

- 根站点为主入口；项目站点可选，两者内容一致但 base 不同。
- 两个仓库需要同步推送；当前未配置自动镜像或跨仓库部署令牌。
- 深层链接刷新可用，但 HTTP 状态为 404（Pages 限制）。
- 404 页面与首页内容相同；可用 `usePageMeta` 设置 noindex，但无法改变 HTTP 状态。
- 自定义域名仍使用 base `/`，只需调整 `SITE_URL` 与 DNS/CNAME。
