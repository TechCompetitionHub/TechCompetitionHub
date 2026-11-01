import { Link } from 'react-router-dom';
import { SITE } from '../services/site';

const FOOTER_GROUPS = [
  {
    title: '产品',
    links: [
      { to: '/competitions', label: '竞赛目录' },
      { to: '/rankings', label: '价值榜' },
      { to: '/projects', label: '项目成果' },
      { to: '/skills', label: '技能图谱' },
      { to: '/planner', label: '成长规划' },
    ],
  },
  {
    title: '透明与治理',
    links: [
      { to: '/data-policy', label: '数据政策' },
      { to: '/scoring-method', label: '评分方法' },
      { to: '/privacy', label: '隐私说明' },
      { to: '/about', label: '关于本站' },
      { to: '/contribute', label: '贡献指南' },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-navy-900 text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-lg font-bold">TechCompetitionHub</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
            面向大学生的开源科技竞赛成长平台。竞赛事实来自官方来源并标注核验状态；平台评分为可解释的社区方法论评估，不是官方排名。
          </p>
          <p className="mt-4 text-xs leading-5 text-white/55">
            代码：{SITE.license}
            。许可证最终选择需维护者确认。本站不收集账户、联系方式或学生身份信息。
          </p>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="text-xs font-bold tracking-[0.18em] text-white/60 uppercase">
              {group.title}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/80 hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 TechCompetitionHub 贡献者。内容以 CC BY 4.0 授权（待维护者确认）。</p>
          <div className="flex flex-wrap gap-4">
            <a
              href={SITE.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              GitHub 仓库<span className="sr-only">（在新标签页打开）</span>
            </a>
            <a
              href={SITE.discussions}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              Discussions<span className="sr-only">（在新标签页打开）</span>
            </a>
            <Link to="/data-policy" className="hover:text-white">
              免责声明与数据来源
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
