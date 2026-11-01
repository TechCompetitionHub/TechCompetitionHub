export const SITE = {
  name: 'TechCompetitionHub',
  tagline: '大学生科技竞赛开源成长平台',
  repo: 'https://github.com/TechCompetitionHub/TechCompetitionHub',
  issues: 'https://github.com/TechCompetitionHub/TechCompetitionHub/issues',
  discussions: 'https://github.com/TechCompetitionHub/TechCompetitionHub/discussions',
  contributing:
    'https://github.com/TechCompetitionHub/TechCompetitionHub/blob/main/CONTRIBUTING.md',
  license: 'MIT（代码）/ CC BY 4.0（原创文档）',
  pagesBaseUrl: 'https://techcompetitionhub.github.io/TechCompetitionHub/',
} as const;

export function issueTemplateUrl(template: string): string {
  return `${SITE.issues}/new?template=${encodeURIComponent(template)}`;
}

export function discussionCategoryNote(): string {
  return '分类需由维护者在 GitHub 仓库设置中启用 Discussions 后创建；站内不链接不存在的分类。';
}

export const COMMUNITY_CATEGORIES = [
  { name: '📢 Announcements', purpose: '维护者发布版本、数据与规则变更', mode: '公告' },
  { name: '🧭 Competition Help', purpose: '竞赛选择、规则理解与报名咨询', mode: '问答' },
  { name: '🧪 Preparation & Retrospectives', purpose: '备赛经验、复盘与失败教训', mode: '讨论' },
  { name: '💻 Technical Q&A', purpose: '技术问题与可复现的排错记录', mode: '问答' },
  { name: '🤝 Team Up', purpose: '组队招募（禁止公开手机号等敏感信息）', mode: '讨论' },
  { name: '🚀 Project Showcase', purpose: '项目展示、复现与证据链接', mode: '讨论' },
  { name: '💡 Ideas & Feedback', purpose: '产品建议与数据纠错讨论', mode: '讨论' },
  { name: '🗳 Polls', purpose: '公开投票与社区共识', mode: '投票' },
] as const;
