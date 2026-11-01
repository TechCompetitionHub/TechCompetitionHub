# GitHub Pages 部署说明

站点是纯静态 SPA，构建产物在 `dist/`。使用 GitHub Actions 构建并部署，不提交 `dist/`。

> 2026-11-01：根站点已启用并通过 GitHub Actions 部署到 `https://techcompetitionhub.github.io/`；主仓库项目站点镜像也已部署到 `https://techcompetitionhub.github.io/TechCompetitionHub/`。以下步骤保留用于迁移、重建或故障恢复。

## 1. 发布目标

| 用途                 | 仓库                                              | URL                                                        | `VITE_BASE_PATH`       |
| -------------------- | ------------------------------------------------- | ---------------------------------------------------------- | ---------------------- |
| **主站点（根域名）** | `TechCompetitionHub/TechCompetitionHub.github.io` | `https://techcompetitionhub.github.io/`                    | `/`（默认）            |
| 项目站点（可选镜像） | `TechCompetitionHub/TechCompetitionHub`           | `https://techcompetitionhub.github.io/TechCompetitionHub/` | `/TechCompetitionHub/` |

两个仓库使用**同一提交**与同一套工作流。部署工作流按仓库名自动选择 base 与 `SITE_URL`：

```bash
REPO_NAME="${GITHUB_REPOSITORY#*/}"
OWNER_LOWER=$(printf '%s' "${GITHUB_REPOSITORY_OWNER}" | tr '[:upper:]' '[:lower:]')
if [ "$REPO_NAME" = "TechCompetitionHub.github.io" ]; then
  export VITE_BASE_PATH="/"
  export SITE_URL="https://${OWNER_LOWER}.github.io"
else
  export VITE_BASE_PATH="/${REPO_NAME}/"
  export SITE_URL="https://${OWNER_LOWER}.github.io/${REPO_NAME}"
fi
```

因此不需要为两个仓库维护两份构建配置。

## 2. 首次部署步骤（根站点）

1. 确认 `TechCompetitionHub.github.io` 的 `main` 与主仓库指向同一提交。
2. 打开根站点仓库 **Settings → Pages**。
3. **Build and deployment → Source** 选择 **GitHub Actions**。
4. 推送 `main`，或在 **Actions → Deploy GitHub Pages → Run workflow** 手动触发。
5. 等待 `build` 与 `deploy` 成功。
6. 打开 `https://techcompetitionhub.github.io/`，检查：
   - 首页、竞赛目录、详情、排行榜、技能、规划器、指南、社区、404；
   - 直接刷新 `/competitions/cumcm` 不白屏；
   - 静态资源路径以 `/assets/` 开头；
   - `sitemap.xml` 与 `robots.txt` 可访问；
   - 移动端 375px 无横向溢出，键盘 Tab 顺序与焦点可见。

> Pages 未启用时，工作流会在 **Setup Pages** 步骤失败；这是预期状态。启用后重新运行即可。`main` 的检查步骤（安装、格式、Lint、类型、测试、数据、Schema）应全部通过。

## 3. 项目站点（可选）

在 `TechCompetitionHub/TechCompetitionHub` 仓库同样把 Pages Source 设为 GitHub Actions。工作流检测到仓库名为 `TechCompetitionHub`，使用 base `/TechCompetitionHub/`，部署到 `https://techcompetitionhub.github.io/TechCompetitionHub/`。

项目站点可作为开发预览或备用入口；根站点是主入口，两者内容相同。

## 4. 工作流

`.github/workflows/deploy-pages.yml`：

- 触发：`push` 到 `main`、`workflow_dispatch`。
- 权限：`contents: read`、`pages: write`、`id-token: write`。
- 并发：`pages`，不取消进行中的部署。
- `build` job：`npm ci` → 格式 → Lint → 类型 → 测试 → 数据校验 → Schema 漂移 → `configure-pages` → 动态 base 构建 → `upload-pages-artifact`。
- `deploy` job：`deploy-pages`，环境 `github-pages`。

PR 由 `.github/workflows/ci.yml` 检查，不部署。

## 5. 深层链接与 404

GitHub Pages 不支持 SPA rewrites。`scripts/postbuild.ts` 会：

- 复制 `dist/index.html` 为 `dist/404.html`；
- 写入 `.nojekyll`；
- 生成 `sitemap.xml` 与 `robots.txt`；
- 校验构建产物包含预期 base。

当用户直接访问 `/competitions/xxx` 时，Pages 返回 `404.html`（内容与 `index.html` 相同），React Router 读取真实 URL 并渲染详情页。HTTP 状态仍是 404，但页面可用；这是 GitHub Pages 的已知限制。

## 6. 同步两个仓库

同一提交需要推送到两个远程：

```bash
git remote add root https://github.com/TechCompetitionHub/TechCompetitionHub.github.io.git
git push origin main
git push root main
```

本机可使用已配置的 SSH 身份推送到两个仓库。根站点仓库必须命名为 `TechCompetitionHub.github.io`，否则 GitHub Pages 不会把它当作组织根站点。

## 7. 自定义域名

1. 在根站点仓库 Pages 设置中填写 Custom domain。
2. 按 GitHub 文档配置 DNS（A/AAAA 或 CNAME）。
3. 启用 HTTPS。
4. 根域名/自定义域名仍使用 `VITE_BASE_PATH=/`；把 `SITE_URL` 改为自定义域名。
5. 在 `public/` 放置 `CNAME` 文件（Vite 会复制到 `dist/`），或通过 Pages 设置写入。

## 8. 排障

| 现象               | 检查                                                       |
| ------------------ | ---------------------------------------------------------- |
| Setup Pages 失败   | Pages Source 是否为 GitHub Actions；仓库是否启用 Pages     |
| 页面白屏、资源 404 | 构建时 base 是否与仓库类型匹配；根站点必须为 `/`           |
| 刷新详情页 404     | `dist/404.html` 是否存在；Pages 是否使用 Actions 部署      |
| 样式丢失           | 是否使用 `npm run build`；Tailwind 是否在构建中运行        |
| 部署 job 权限错误  | `permissions` 是否包含 `pages: write` 与 `id-token: write` |
| sitemap URL 错误   | 构建时 `SITE_URL` 是否与最终域名一致                       |
| 外部链接检查失败   | 外站可能临时不可用；链接检查是非阻塞的每周任务             |

## 9. 回滚

- 在 **Actions → Deploy GitHub Pages** 中找到上一个成功部署的提交，重新运行 `workflow_dispatch`。
- 或 revert 造成问题的提交并推送到两个仓库。
- 数据错误可单独 revert 对应 JSON 文件；不要删除历史记录。

## 10. 发布后检查

- [ ] 根站点 `/` 可访问，资源使用 `/assets/`。
- [ ] 深层链接直接刷新不白屏。
- [ ] 移动端 375px 无横向溢出。
- [ ] 键盘 Tab 顺序合理，焦点可见。
- [ ] `sitemap.xml` 使用根域名并包含主要路由与数据详情页。
- [ ] 页面没有虚构统计或未授权内容。
- [ ] 根站点仓库 About 中设置主页 URL 与 Topics。
