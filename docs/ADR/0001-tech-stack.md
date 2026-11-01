# ADR 0001：前端技术栈

- 状态：已采纳
- 日期：2026-11-01

## 背景

首版需要低成本部署到 GitHub Pages，支持搜索、筛选、评分解释、技能图谱和规则式规划；贡献者应能用 JSON/Markdown 与 PR 维护内容。团队规模小，不能维护服务器、数据库或复杂构建系统。

## 决策

采用 React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4 + React Router 7。

- 数据校验用 Zod 4，生成 JSON Schema。
- Markdown 用 react-markdown + remark-gfm，不启用原始 HTML。
- 测试用 Vitest + Testing Library；可访问性用 axe-core。
- 不引入 Redux、微前端、Turborepo/Nx、组件库或图表库。

## 备选方案

- **Next.js 静态导出**：能预渲染，但对首版贡献门槛和构建复杂度更高；当前数据规模不需要。
- **Astro**：内容站友好，但规划器与筛选交互需要额外岛屿配置；团队更熟悉 React SPA。
- **Vue/Svelte**：同样可行；选择 React 是生态与贡献者熟悉度考虑。
- **纯手写 HTML/JS**：难以维护评分、技能图与规划器的类型与测试。

## 后果

- 构建简单、依赖少、Pages 可直接托管。
- SPA 需要 `404.html` 回退；SEO 依赖静态 meta 与 sitemap，未做逐页预渲染。
- 后续若需要更强 SEO，可迁移到预渲染或静态生成，数据与领域逻辑可复用。
