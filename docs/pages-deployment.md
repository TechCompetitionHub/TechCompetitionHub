# GitHub Pages 部署说明

站点是纯静态 SPA，构建产物在 `dist/`。推荐使用 GitHub Actions 构建并部署，而不是提交 `dist/`。

## 1. 两种发布目标

| 目标             | 仓库                                              | URL                                                        | `VITE_BASE_PATH`               |
| ---------------- | ------------------------------------------------- | ---------------------------------------------------------- | ------------------------------ |
| 项目站点（推荐） | `TechCompetitionHub/TechCompetitionHub`           | `https://techcompetitionhub.github.io/TechCompetitionHub/` | `/TechCompetitionHub/`（默认） |
| 组织根站点       | `TechCompetitionHub/TechCompetitionHub.github.io` | `https://techcompetitionhub.github.io/`                    | `/`                            |

当前仓库的默认构建与工作流面向**项目站点**。组织根站点仓库目前为空；如果希望根域名站点：

### 方案 A：把源码放在 `.github.io` 仓库

将同一套源码放到 `TechCompetitionHub.github.io`，在部署工作流中设置：

```yaml
env:
  VITE_BASE_PATH: /
```

并把 `SITE_URL` 改为 `https://techcompetitionhub.github.io`。工作流、数据与测试不需要改。

### 方案 B：保留主仓库，根站点做重定向

在 `.github.io` 仓库放一个最小静态页面，重定向到 `/TechCompetitionHub/`。这样主仓库仍是唯一源码，但根域名不是完整站点。此方案不推荐用于长期 SEO。

### 方案 C：跨仓库部署

使用带 Pages 权限的细粒度 PAT 将 `dist/` 推送到 `.github.io`。这会引入额外密钥与权限，首版不采用；如确需使用，必须限制 token 范围、仅存于 Actions Secrets，并记录在 SECURITY.md。

## 2. 首次部署步骤（项目站点）

1. 确认 `main` 分支包含本仓库代码。
2. 打开仓库 **Settings → Pages**。
3. **Build and deployment → Source** 选择 **GitHub Actions**。
4. 推送 `main`，或在 **Actions → Deploy GitHub Pages → Run workflow** 手动触发。
5. 等待 `build` 与 `deploy` 两个 job 成功。
6. 打开 `https://techcompetitionhub.github.io/TechCompetitionHub/`，检查：
   - 首页与竞赛目录加载；
   - 直接刷新 `/competitions/cumcm` 不 404；
   - `sitemap.xml` 与 `robots.txt` 可访问；
   - 静态资源路径以 `/TechCompetitionHub/assets/` 开头；
   - 移动端导航与键盘焦点可用。

## 3. 工作流

`.github/workflows/deploy-pages.yml`：

- 触发：`push` 到 `main`、`workflow_dispatch`。
- 权限：`contents: read`、`pages: write`、`id-token: write`。
- 并发：`pages`，不取消进行中的部署。
- `build` job：`npm ci` → 格式 → Lint → 类型 → 测试 → 数据校验 → Schema 漂移 → `configure-pages` → `npm run build` → `upload-pages-artifact`。
- `deploy` job：`deploy-pages`，环境 `github-pages`。

PR 由 `.github/workflows/ci.yml` 检查，不部署。

## 4. 深层链接与 404

GitHub Pages 不支持 SPA rewrites。`scripts/postbuild.ts` 会：

- 复制 `dist/index.html` 为 `dist/404.html`；
- 写入 `.nojekyll`；
- 生成 `sitemap.xml` 与 `robots.txt`；
- 校验构建产物包含预期 base。

当用户直接访问 `/competitions/xxx` 时，Pages 返回 `404.html`（内容与 `index.html` 相同），React Router 读取真实 URL 并渲染详情页。HTTP 状态仍是 404，但页面可用；这是 GitHub Pages 的已知限制。

## 5. 自定义域名

1. 在仓库 Pages 设置中填写 Custom domain。
2. 按 GitHub 文档配置 DNS（A/AAAA 或 CNAME）。
3. 启用 HTTPS。
4. 如果使用根域名或自定义域名，构建时设置 `VITE_BASE_PATH=/`，并把 `SITE_URL` 改为自定义域名。
5. 在 `public/` 放置 `CNAME` 文件（Vite 会复制到 `dist/`），或通过 Pages 设置写入。

## 6. 排障

| 现象               | 检查                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| 页面白屏、资源 404 | `dist/index.html` 的资源路径是否以正确 base 开头；构建时是否设置了错误 `VITE_BASE_PATH`        |
| 刷新详情页 404     | `dist/404.html` 是否存在；Pages 是否使用 Actions 部署                                          |
| 样式丢失           | 是否使用 `npm run build` 而不是直接部署源码；Tailwind 是否在构建中运行                         |
| 部署 job 权限错误  | `permissions` 是否包含 `pages: write` 与 `id-token: write`；Pages Source 是否为 GitHub Actions |
| sitemap URL 错误   | 构建时 `SITE_URL` 是否与最终域名一致                                                           |
| 外部链接检查失败   | 外站可能临时不可用；链接检查是非阻塞的每周任务，不要因此回滚站点                               |

## 7. 回滚

- 在 **Actions → Deploy GitHub Pages** 中找到上一个成功部署的提交，重新运行 `workflow_dispatch`。
- 或 revert 造成问题的提交并推送 `main`。
- 数据错误可单独 revert 对应 JSON 文件；不要删除历史记录。

## 8. 发布后检查

- [ ] 首页、目录、详情、排行榜、技能、规划器、指南、社区、404 均可访问。
- [ ] 直接刷新深层链接不白屏。
- [ ] 移动端 375px 无横向溢出。
- [ ] 键盘 Tab 顺序合理，焦点可见。
- [ ] `sitemap.xml` 包含主要路由与数据详情页。
- [ ] 页面没有虚构统计或未授权内容。
- [ ] 在仓库 About 中设置描述、主页 URL 与 Topics。
