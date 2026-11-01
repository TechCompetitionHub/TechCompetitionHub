import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { ButtonLink } from '../components/Button';
import { Container, PageHeader, SectionHeading } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { getDomainOptions, listCompetitions } from '../services/competitionService';

export function CategoriesPage() {
  usePageMeta({
    title: '竞赛类别',
    description:
      '按机器人、嵌入式、电子设计、机械与工程、软件开发、创新创业等类别浏览竞赛；数量来自当前仓库真实数据。',
  });

  const competitions = listCompetitions();
  const categories = getDomainOptions()
    .map((domain) => {
      const items = competitions.filter((competition) => competition.domains.includes(domain.id));
      return {
        ...domain,
        verified: items.filter((item) => item.verification_status === 'verified').length,
        scored: items.filter((item) => item.scores !== null).length,
      };
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'zh-CN'));

  return (
    <>
      <PageHeader
        eyebrow="竞赛类别"
        title="按技术方向找竞赛"
        description="类别来自受控领域词表，避免同一方向被拆成多个标签。每个类别列出收录数量、核验数量与已评分数量；数量为 0 的类别仍可进入，页面会说明暂无数据。"
        actions={
          <>
            <ButtonLink to="/competitions">全部竞赛</ButtonLink>
            <ButtonLink to="/submit-competition" variant="secondary">
              提交竞赛
            </ButtonLink>
          </>
        }
      />

      <Container className="py-8">
        <SectionHeading
          eyebrow="全部类别"
          title="从方向进入，而不是从排名进入"
          description="类别页只做筛选与解释，不改变平台评分或正式排名。"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
              className="card-hover fade-up group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-bold text-ink-900 group-hover:text-brand-700">
                  {category.label}
                </h2>
                <Badge tone={category.count > 0 ? 'brand' : 'neutral'}>{category.count} 条</Badge>
              </div>
              <p className="mt-2 flex-1 text-sm leading-6 text-ink-500">{category.description}</p>
              <p className="mt-4 text-xs text-ink-500">
                已核验 {category.verified} · 已评分 {category.scored}
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
