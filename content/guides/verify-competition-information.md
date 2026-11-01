---
title: 竞赛信息核验与贡献：怎样写一条可信的数据
summary: 从官方来源、字段填写、未知值处理到 PR 校验，说明一条竞赛数据如何进入平台。
category: guide
tags:
  - 数据治理
  - 贡献
  - 核验
author: TechCompetitionHub 维护者
updated_at: '2026-11-01'
draft: false
related_competition_ids: []
related_skill_ids:
  - technical-writing
  - git-collaboration
---

## 平台的数据原则

TechCompetitionHub 不是竞赛新闻聚合站。每条公开竞赛数据必须能回答三个问题：

1. 这条事实来自哪里？
2. 什么时候核验的？
3. 哪些字段仍然未知？

无法回答时，正确做法是把字段留空并标记状态，而不是猜测。平台使用 `draft`、`needs_review`、`verified`、`stale`、`rejected` 五种状态；`verified` 只表示关键事实已按来源核对，不表示所有字段永远正确。

## 一、来源优先级

1. 官方竞赛网站、官方章程、组委会通知；
2. 主办/承办单位的正式页面；
3. 高校教务部门或权威机构资料；
4. 可信媒体；
5. 参赛者经验与社区讨论（用于经验，不替代官方规则）。

高等级来源不意味着其中每句话都正确。关键事实（名称、主办方、资格、时间、费用）仍要交叉核对。

## 二、字段怎么写

### 必填字段

- `id`：稳定的小写 kebab-case slug，不要随年份改变。
- `name`：官方名称，不要用宣传口号代替。
- `domains`：从受控词表选择，不要自造同义标签。
- `summary` 与 `description`：客观描述，不写“最好”“唯一”“官方排名”等无法核验的表述。
- `audience`、`format`、`difficulty`：说明依据；不确定的团队人数写 `null`。
- `official_urls` 与 `sources`：至少一个官方入口和一条来源记录。
- `verification_status`、`last_verified_at`、`created_at`、`updated_at`。

### 未知值

- 未知文本/日期：`null`，页面显示“待核验”。
- 未知数值：`null`。
- 未知列表：空数组。
- 未知评分：`scores: null`，不要填 0 或 100。

### 时间

- 使用 `YYYY-MM-DD`。
- 只有年份或周期时，不要伪造具体日期；写在 `schedule.notes` 里，并保持日期为 `null`。
- `schedule.status` 可用 `confirmed`、`partial`、`expected`、`unknown`、`not_applicable`。

## 三、评分不是官方事实

平台评分是编辑评估，不是官方排名。写评分时：

- 每个维度必须有可读的理由；
- 证据不足的维度不要给满分；
- 未知维度不要自动记为 0；
- 评分模型版本变化要记录在 `data/scoring-models/` 的 `changelog`；
- 资料不足的条目留在“资料不足”列表，不进入正式排名。

## 四、提交流程

1. 用 Issue 模板提交新增或纠错，附上来源链接与访问日期。
2. 在本地新增/修改 `data/` 下的 JSON 文件，文件名与 `id` 一致。
3. 运行：

```bash
npm ci
npm run data:validate
npm run data:schemas:check
npm run test
npm run build
```

4. 提交 PR，说明改了什么、来源是什么、哪些字段仍未知。
5. CI 会检查 Schema、重复 ID、引用关系、技能依赖环、评分权重与构建。
6. 维护者复核来源与时效性后合并；重要事实变化写入 `CHANGELOG.md`。

## 五、常见拒稿原因

- 只有二手介绍，没有官方来源；
- 把往年日期写成当年确定日期；
- 用 0 分表示“不知道”；
- 引用不存在的技能或资源 ID；
- 把示例数据放进正式目录；
- 提交未授权的图片、题目或他人代码；
- 在描述里写无法核验的“全国第一”“官方认证”。

## 六、纠错比新增更重要

如果你发现已有数据过期或错误：

1. 指出字段、当前值、建议值与来源；
2. 如果是主观评分争议，进入公开讨论并记录观点；
3. 事实错误优先修正；评分方法争议通过版本化流程处理；
4. 修正后更新 `last_verified_at` 与 `updated_at`。

平台宁可少一条数据，也不愿多一条看起来确定但无法追溯的数据。
