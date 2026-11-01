export interface ForumTemplate {
  id: string;
  title: string;
  body: string;
}

export interface ForumRelatedLink {
  label: string;
  to: string;
}

export interface ForumCategoryDetail {
  summary: string;
  suitable: string[];
  notSuitable: string[];
  templates: ForumTemplate[];
  related: ForumRelatedLink[];
}

export const FORUM_CATEGORY_DETAILS: Record<string, ForumCategoryDetail> = {
  announcements: {
    summary:
      '只读公告区。用于发布版本更新、评分模型/数据规则变更、维护窗口与重要社区事项；不用于提问或组队。',
    suitable: ['版本与数据变更公告', '评分模型或规则变更', '维护窗口与故障说明'],
    notSuitable: ['竞赛咨询', '组队招募', '项目展示'],
    templates: [
      {
        id: 'announcement',
        title: '公告模板',
        body: `【公告类型】版本 / 数据 / 规则 / 维护
【影响范围】
【生效时间】
【变更内容】
【需要用户做什么】
【相关链接】
【回滚或纠错方式】`,
      },
    ],
    related: [
      { label: '变更日志', to: '/about' },
      { label: '数据政策', to: '/data-policy' },
    ],
  },
  'q-a': {
    summary:
      '提问与解答区。竞赛选择、规则理解、备赛方法和技术问题都可以在这里提问；请附官方来源、环境与已尝试方案。',
    suitable: ['竞赛规则与报名条件咨询', '技术问题的最小复现', '备赛方法与资料选择'],
    notSuitable: ['无来源的“听说”', '招生/保研承诺', '未授权的试题或内部资料'],
    templates: [
      {
        id: 'competition-help',
        title: '竞赛咨询模板',
        body: `【想了解的竞赛】
【你的背景与目标】
【具体问题】
【已查过的官方来源与日期】
【希望得到的帮助】
【不公开的敏感信息（不要填写）】`,
      },
      {
        id: 'technical-question',
        title: '技术问答模板',
        body: `【问题一句话】
【环境：系统 / 版本 / 工具链】
【最小复现步骤】
【期望结果与实际结果】
【错误信息】
【已尝试方案】
【相关代码或仓库链接】`,
      },
    ],
    related: [
      { label: '竞赛目录', to: '/competitions' },
      { label: '评分方法', to: '/scoring-method' },
    ],
  },
  'show-and-tell': {
    summary:
      '经验与成果展示区。欢迎写备赛复盘、失败教训、项目复现与证据链接；请区分事实、个人观点与未经验证的推测。',
    suitable: ['备赛复盘与时间线', '项目展示与复现步骤', '失败教训与方法改进'],
    notSuitable: ['纯宣传海报', '未授权的代码或素材', '虚构获奖与参赛经历'],
    templates: [
      {
        id: 'retrospective',
        title: '备赛复盘模板',
        body: `【竞赛 / 年份 / 赛道】
【团队与分工】
【时间线与关键决策】
【做对了什么】
【踩过的坑】
【如果重来会怎么改】
【对后来者的建议】
【可公开的证据链接】`,
      },
      {
        id: 'project-showcase',
        title: '项目展示模板',
        body: `【项目名称】
【一句话说明】
【关联竞赛】
【技术栈】
【仓库 / 演示 / 文档】
【复现步骤】
【结果与限制】
【许可证】
【公开证据】`,
      },
    ],
    related: [
      { label: '经验指南', to: '/guides' },
      { label: '项目成果', to: '/projects' },
    ],
  },
  general: {
    summary:
      '综合讨论区。适合组队招募、跨校协作与不适合其它分类的话题；组队帖不要公开手机号、身份证或住址。',
    suitable: ['组队招募与角色需求', '跨校协作', '社区活动与综合讨论'],
    notSuitable: ['竞赛事实纠错（请走数据政策）', '广告与付费课程推销', '公开他人隐私'],
    templates: [
      {
        id: 'team-up',
        title: '组队模板',
        body: `【竞赛 / 赛道】
【目标：学习 / 获奖 / 作品】
【需要的角色与最低能力】
【现有成员与分工】
【每周可投入时间】
【沟通方式：GitHub / 公开群组】
【不希望公开的信息（不要填写敏感信息）】`,
      },
    ],
    related: [
      { label: '成长规划', to: '/planner' },
      { label: '技能图谱', to: '/skills' },
    ],
  },
  ideas: {
    summary:
      '建议与纠错讨论区。产品想法、可访问性反馈和数据结构建议可在这里讨论；确定性数据纠错请同时走 Issue/PR。',
    suitable: ['产品功能建议', '可访问性与体验反馈', '数据字段与校验规则讨论'],
    notSuitable: ['没有来源的事实断言', '重复灌水', '要求删除有来源的负面评价'],
    templates: [
      {
        id: 'product-idea',
        title: '建议模板',
        body: `【建议类型】功能 / 数据 / 可访问性 / 文档
【要解决的问题】
【建议方案】
【影响范围】
【可接受的取舍】
【是否愿意提交 PR】`,
      },
      {
        id: 'data-correction',
        title: '数据纠错模板',
        body: `【竞赛 / 字段】
【当前值】
【建议值】
【官方来源 URL 与访问日期】
【证据说明】
【是否愿意提交 PR】`,
      },
    ],
    related: [
      { label: '贡献指南', to: '/contribute' },
      { label: '数据政策', to: '/data-policy' },
    ],
  },
  polls: {
    summary:
      '投票区。用于公开、非误导性的社区投票；投票结果只代表参与者意见，不代表平台评分或官方结论。',
    suitable: ['社区活动时间/主题', '公开需求排序', '非敏感的产品取舍'],
    notSuitable: ['竞赛排名“谁更强”', '收集个人敏感信息', '付费刷票或诱导投票'],
    templates: [
      {
        id: 'poll',
        title: '投票模板',
        body: `【投票主题】
【为什么要投票】
【选项与含义】
【投票时间】
【结果如何使用】
【样本与限制】`,
      },
    ],
    related: [
      { label: '价值榜说明', to: '/rankings' },
      { label: '评分方法', to: '/scoring-method' },
    ],
  },
};

export function getForumCategoryDetail(slug: string): ForumCategoryDetail | undefined {
  return FORUM_CATEGORY_DETAILS[slug];
}
