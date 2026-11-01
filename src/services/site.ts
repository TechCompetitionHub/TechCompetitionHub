export const SITE = {
  name: 'TechCompetitionHub',
  tagline: '大学生科技竞赛开源成长平台',
  repo: 'https://github.com/TechCompetitionHub/TechCompetitionHub',
  issues: 'https://github.com/TechCompetitionHub/TechCompetitionHub/issues',
  discussions: 'https://github.com/TechCompetitionHub/TechCompetitionHub/discussions',
  contributing:
    'https://github.com/TechCompetitionHub/TechCompetitionHub/blob/main/CONTRIBUTING.md',
  license: 'MIT（代码）/ CC BY 4.0（原创文档）',
  pagesBaseUrl: 'https://techcompetitionhub.github.io/',
} as const;

export function issueTemplateUrl(template: string): string {
  return `${SITE.issues}/new?template=${encodeURIComponent(template)}`;
}

export function discussionCategoryUrl(slug: string): string {
  return `${SITE.discussions}/categories/${slug}`;
}

export function discussionSearchUrl(query: string): string {
  return `${SITE.discussions}?discussions_q=${encodeURIComponent(query)}`;
}

export function forumPath(slug?: string): string {
  return slug ? `/forum/${slug}` : '/forum';
}

export function discussionCategoryNote(): string {
  return 'Discussions 已启用；当前使用 GitHub 默认 6 个分类，站内论坛页提供分类规则、发帖模板与直达入口。';
}

export interface CommunityCategory {
  slug: string;
  name: string;
  purpose: string;
  mode: string;
  url: string;
}

export const COMMUNITY_CATEGORIES: CommunityCategory[] = [
  {
    slug: 'announcements',
    name: '📢 Announcements',
    purpose: '维护者发布版本、数据与规则变更',
    mode: '公告',
    url: discussionCategoryUrl('announcements'),
  },
  {
    slug: 'q-a',
    name: '❓ Q&A',
    purpose: '竞赛选择、规则理解与技术问答',
    mode: '问答',
    url: discussionCategoryUrl('q-a'),
  },
  {
    slug: 'show-and-tell',
    name: '🙌 Show and tell',
    purpose: '备赛经验、复盘与项目展示',
    mode: '讨论',
    url: discussionCategoryUrl('show-and-tell'),
  },
  {
    slug: 'general',
    name: '💬 General',
    purpose: '综合讨论、组队招募与社区协作',
    mode: '讨论',
    url: discussionCategoryUrl('general'),
  },
  {
    slug: 'ideas',
    name: '💡 Ideas',
    purpose: '产品建议与数据纠错讨论',
    mode: '讨论',
    url: discussionCategoryUrl('ideas'),
  },
  {
    slug: 'polls',
    name: '🗳 Polls',
    purpose: '公开投票与社区共识',
    mode: '投票',
    url: discussionCategoryUrl('polls'),
  },
];

export const COMMUNITY_CATEGORY_BY_SLUG = new Map(
  COMMUNITY_CATEGORIES.map((category) => [category.slug, category]),
);
