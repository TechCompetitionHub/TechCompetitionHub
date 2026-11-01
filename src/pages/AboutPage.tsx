import { Link } from 'react-router-dom';
import { ButtonLink } from '../components/Button';
import { Container, PageHeader, SectionHeading } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { ExternalLink } from '../components/ExternalLink';
import { countVerifiedCompetitions, listCompetitions } from '../services/competitionService';
import { countGuides } from '../services/contentService';
import { listSkills } from '../services/skillService';
import { SITE } from '../services/site';

export function AboutPage() {
  usePageMeta({
    title: '关于本站',
    description:
      'TechCompetitionHub 是面向大学生的开源科技竞赛成长平台，提供可追溯的竞赛数据、公开评分方法、技能图谱与规则式成长规划。',
  });

  const competitions = listCompetitions();
  const skills = listSkills();

  return (
    <>
      <PageHeader
        eyebrow="关于"
        title="一个把“可信”放在“好看”之前的竞赛平台"
        description="TechCompetitionHub 用结构化数据、公开方法和可复现的项目成果，帮助大学生完成从了解竞赛到准备、展示与成长的过程。"
        actions={<ButtonLink to="/competitions">浏览竞赛目录</ButtonLink>}
      />

      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
          <div className="space-y-10">
            <section aria-labelledby="why-heading">
              <SectionHeading
                id="why-heading"
                eyebrow="为什么做"
                title="竞赛信息不缺，缺的是可核验的结构"
              />
              <div className="space-y-4 text-base leading-8 text-ink-700">
                <p>
                  竞赛信息常常散落在通知、公众号、群聊与二手经验里：名称不统一、时间不带年份、费用靠猜、评分靠感觉。学生很难比较“这场竞赛是否适合我”，贡献者也很难判断“这条信息是否可信”。
                </p>
                <p>
                  这个平台把竞赛事实、社区经验、项目证据与能力规划分开建模：事实要有来源与核验日期，经验要标明是观点，评分要公开方法与限制，项目要能复现。我们不把“奖项数量”当作个人价值的唯一尺度。
                </p>
              </div>
            </section>

            <section aria-labelledby="what-heading">
              <SectionHeading id="what-heading" eyebrow="提供什么" title="四类功能，均衡建设" />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['竞赛目录与详情', '领域、对象、难度、形式、费用与来源；未知信息明确标注。'],
                  ['可解释的排行榜', '六维评分、版本化权重、证据等级与准入规则。'],
                  ['项目与技能图谱', '可复现项目、L0–L4 行为等级、前置依赖与练习任务。'],
                  ['规则式成长规划', '技能缺口、拓扑排序、验收标准与 Markdown 导出。'],
                ].map(([title, description]) => (
                  <div key={title} className="rounded-xl border border-line bg-surface p-4">
                    <h3 className="font-semibold text-ink-900">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-ink-500">{description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="not-heading">
              <SectionHeading id="not-heading" eyebrow="边界" title="平台不做什么" />
              <ul className="space-y-2 text-sm leading-6 text-ink-700">
                <li>· 不是竞赛主办方，不提供报名、缴费或证书服务；</li>
                <li>· 不宣称评分是官方排名、权威认证或对保研/就业结果的预测；</li>
                <li>· 不根据学校、地区或家庭背景评价学生；</li>
                <li>· 不在首版建立账户、私信、论坛或数据库；</li>
                <li>· 不把未经授权的课程、论文、题库或他人作品复制进仓库；</li>
                <li>· 不在没有证据时自动验证获奖、项目贡献或个人技能。</li>
              </ul>
            </section>

            <section aria-labelledby="status-heading">
              <SectionHeading
                id="status-heading"
                eyebrow="当前状态"
                title="真实数字，不用占位统计"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-line bg-surface p-4">
                  <p className="text-2xl font-bold text-ink-900">{competitions.length}</p>
                  <p className="text-xs text-ink-500">公开竞赛条目</p>
                </div>
                <div className="rounded-xl border border-line bg-surface p-4">
                  <p className="text-2xl font-bold text-ink-900">{countVerifiedCompetitions()}</p>
                  <p className="text-xs text-ink-500">已核验关键事实</p>
                </div>
                <div className="rounded-xl border border-line bg-surface p-4">
                  <p className="text-2xl font-bold text-ink-900">{skills.length}</p>
                  <p className="text-xs text-ink-500">技能条目</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-ink-500">
                当前有 {countGuides()}{' '}
                篇指南。数字直接来自仓库数据；没有用户数、访问量或“实时在线”统计。
              </p>
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-sm font-bold text-ink-900">开源与许可</h2>
              <p className="mt-1 text-xs leading-5 text-ink-500">
                代码计划采用 MIT，原创文档计划采用 CC BY
                4.0；最终许可由维护者确认。第三方材料遵循原许可证，不默认获得转载授权。
              </p>
              <ExternalLink href={SITE.repo} className="mt-3 inline-block text-xs">
                查看 GitHub 仓库
              </ExternalLink>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-sm font-bold text-ink-900">维护角色</h2>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-ink-700">
                <li>· Maintainer：产品方向、合并与发布</li>
                <li>· Data Reviewer：事实、来源与时效</li>
                <li>· Community Moderator：内容与冲突</li>
                <li>· Contributor：数据、项目、资源与代码</li>
              </ul>
              <Link to="/contribute" className="link-inline mt-3 inline-block text-xs">
                参与贡献
              </Link>
            </div>

            <div className="rounded-2xl border border-line bg-brand-50 p-5">
              <h2 className="text-sm font-bold text-ink-900">反馈</h2>
              <p className="mt-1 text-xs leading-5 text-ink-700">
                数据纠错、功能建议与安全问题有不同渠道。安全漏洞请不要公开到 Issue。
              </p>
              <Link to="/data-policy" className="link-inline mt-3 inline-block text-xs">
                数据政策
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
