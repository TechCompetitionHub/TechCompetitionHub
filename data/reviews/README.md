# 社区参赛评价

此目录保存**审核通过**的用户参赛评价。公开站点只加载 `verification_status: approved` 且 `consent_public: true` 的记录。

当前没有公开评价。用户通过站内“提交参赛评价”生成 Markdown，并在 GitHub Issue 中提交；维护者审核后，按 `data/schemas/community-review.schema.json` 添加 JSON 记录。

## 字段要求

- `competition_id` 必须存在；
- `rating` 为 1–5；
- `participated` 为 true 时，`track` 与 `year` 必填；
- `school`、`public_profile`、`evidence_url` 可选；
- `consent_public` 必须为 true 才能审核通过；
- `verification_status`：pending / approved / rejected；
- approved 必须填写 `reviewed_at`；
- 不得包含手机号、身份证、真实姓名或其他敏感信息。

社区评分是用户自述，不参与平台六维评分，也不进入正式排行榜。
