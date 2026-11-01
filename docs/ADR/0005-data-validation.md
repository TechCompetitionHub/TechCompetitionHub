# ADR 0005：Zod 作为唯一校验器并生成 JSON Schema

- 状态：已采纳
- 日期：2026-11-01

## 背景

需要同时满足：

- TypeScript 类型与运行时数据一致；
- CI 与构建阶段能拦截错误数据；
- 外部贡献者能查看字段说明与 JSON Schema；
- 不引入多套重复校验体系。

## 决策

1. 以 `src/lib/domain/schemas.ts` 的 Zod Schema 为唯一事实来源。
2. TypeScript 类型通过 `z.infer` 推导。
3. 使用 `scripts/generate-schemas.ts` 生成 Draft 2020-12 JSON Schema 到 `data/schemas/`。
4. CI 运行 `data:schemas:check`，防止 Schema 与生成文件漂移。
5. 跨记录校验（重复 ID、引用、循环、权重、日期、示例隔离）在 `src/lib/domain/validateDataset.ts` 中实现，由 `scripts/validate-data.ts` 与测试共用。
6. 不在浏览器运行时做完整跨记录校验；构建/测试阶段负责数据质量。

## 备选方案

- **JSON Schema + Ajv 手写**：需要维护两套定义，类型易漂移。
- **只用 TypeScript 类型**：运行时无校验，JSON 错误会进入页面。
- **只用 JSON Schema**：类型生成与跨记录校验仍需额外工具。

## 后果

- 单一来源，类型与校验一致；JSON Schema 可供编辑器与外部工具使用。
- Zod 增加少量客户端包体积（数据在构建时已打包）。
- 跨记录规则必须以代码表达，文档需同步维护。
- 生成文件必须提交，否则 CI 失败。
