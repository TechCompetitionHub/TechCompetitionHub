# 发布检查清单

本清单依据 PRD 第 14 章整理。`[x]` 表示已在本地实际验证；`[ ]` 表示尚未完成或需要维护者在 GitHub 上操作。不要在没有运行命令的情况下勾选。

## 产品与数据

- [x] 首版范围与非目标明确（README、PRD、关于页）。
- [x] 所有公开竞赛都有唯一 ID（31 条，校验通过）。
- [x] 官方事实有可访问来源（每条 verified 竞赛至少一个 official 来源）。
- [x] 数据核验时间和状态可见（详情页、来源列表、Provenance）。
- [x] 示例数据与正式数据分离（`data/examples/`，`is_example: true`，不加载）。
- [x] 评分维度、权重、缺失值与排名准入规则公开（评分方法页 + 文档）。
- [x] 没有伪造报名时间、获奖信息或参赛人数（未知字段保持 null/待核验）。
- [x] 技能路线有任务产出和验收标准（25 个技能均含练习任务）。
- [x] 社区参赛评价要求公开是否参加过、赛道、年份、学校（可选）、角色与公开主页；已说明自述性质、审核流程，且不参与平台评分。
- [ ] 资源版权和许可证字段齐全（已有 `license_or_access_terms`，但需维护者逐条复核转载权限）。
- [ ] 维护者/领域评审复核首版 8 条平台评分。
- [ ] 至少完成一次真实的新增竞赛 PR 演练。

## 工程

- [x] 干净环境安装成功（`npm ci` 生成锁文件；本地 Node 24 / npm 11）。
- [x] 格式检查通过（`npm run format:check`）。
- [x] Lint 通过（`npm run lint`）。
- [x] 类型检查通过（`npm run typecheck`）。
- [x] 单元/集成测试通过（115 个测试，含 23 条路由的 axe 审计）。
- [x] 数据校验通过（31 竞赛 / 30 技能 / 23 资源 / 2 路线 / 4 文章 / 0 社区评价，0 错误 0 警告）。
- [x] 18 条竞赛包含结构化赛道/组别；其余标注“待补充”，不伪造赛项。
- [x] 生成 Schema 与 Zod 定义一致（`npm run data:schemas:check`）。
- [x] 生产构建通过（`npm run build`）。
- [x] 生产构建 base path 正确（根站点默认 `/`；项目站点 `/TechCompetitionHub/`，postbuild 校验）。
- [x] `404.html`、`.nojekyll`、`sitemap.xml`、`robots.txt` 生成。
- [x] PR 工作流不部署生产站点（`ci.yml` 无 Pages 权限）。
- [x] Pages 工作流权限最小化（contents read、pages write、id-token write）。
- [x] 仓库没有密钥和个人敏感信息（人工检索 + `.gitignore`）。
- [ ] 移动端、键盘操作、空状态和错误状态人工复核（已做自动化与响应式检查，仍需真机/浏览器人工走查）。
- [x] 关键页面有标题、描述与合理 SEO 元数据（`usePageMeta`）。
- [x] 生产预览在真实 GitHub Pages 环境验证（根站点 200、资源 200、404.html 与深层链接回退正常）。
- [ ] 外部链接在线检查（`npm run links:check:online`）在 CI 定期任务中运行一次。

## GitHub 设置

- [ ] 仓库描述、Topics、README 和许可证设置完成。
- [x] 启用 Discussions；当前使用默认 6 个分类，站内已链接实际分类。
- [ ] 配置 Issues 表单（文件已提交）与 PR 模板。
- [x] 根站点与主仓库项目站点均已通过 GitHub Actions 部署（主仓库为镜像）。
- [ ] 检查默认分支保护、必需检查与合并权限。
- [ ] 配置社区行为准则与安全报告流程（文件已提交，需在仓库设置中启用入口）。
- [ ] 配置 Dependabot 告警（`dependabot.yml` 已提交，需在仓库设置中确认）。
- [ ] 添加仓库标签（如 `data`、`bug`、`accessibility`）以便分类。
- [x] 确定发布目标：根站点 `TechCompetitionHub.github.io` 为主，主仓库项目站点为可选镜像。

## 发布说明

- [ ] 明确平台为社区项目，评分不是官方认定（页面已写，发布说明需再次声明）。
- [ ] 公布数据来源政策和评分方法（页面与文档已就绪）。
- [ ] 公布已知限制与纠错入口（README、数据政策、Issue 模板）。
- [ ] 发布版本号和变更日志（CHANGELOG 0.1.0）。
- [ ] 不宣传未经验证的用户规模或排名权威性。

## 本地验证记录

实际命令与结果见 [VERIFICATION_LOG.md](VERIFICATION_LOG.md)。发布前请在目标提交上重新运行 `npm run check`，不要复用旧结果。
