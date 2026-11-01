import { Link, useParams } from 'react-router-dom';
import { ButtonLink } from '../components/Button';
import { Container, PageHeader, SectionHeading } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { EmptyState } from '../components/States';
import { CompetitionCard } from '../features/competitions/CompetitionCard';
import {
  getDomainOptions,
  getValueRanking,
  listCompetitions,
} from '../services/competitionService';

export function CategoryDetailPage() {
  const { domainId = '' } = useParams();
  const domain = getDomainOptions().find((item) => item.id === domainId);
  const competitions = listCompetitions().filter((competition) =>
    competition.domains.includes(domainId),
  );
  const ranking = getValueRanking();
  const rankMap = new Map(ranking.entries.map((entry) => [entry.competition.id, entry]));

  usePageMeta({
    title: domain ? `${domain.label}竞赛` : '竞赛类别不存在',
    description: domain
      ? `${domain.label}类竞赛：${domain.description} 当前收录 ${competitions.length} 条，标注核验状态与平台评分。`
      : '这个竞赛类别不存在。',
  });

  if (!domain) {
    return (
      <Container className="py-16">
        <p className="text-sm font-semibold text-brand-700">404</p>
        <h1 className="mt-2 text-3xl font-bold text-ink-900">这个类别不存在</h1>
        <p className="mt-3 text-sm leading-6 text-ink-500">
          类别来自受控词表；请返回类别列表选择现有类别。
        </p>
        <ButtonLink to="/categories" className="mt-6">
          全部类别
        </ButtonLink>
      </Container>
    );
  }

  const verified = competitions.filter((item) => item.verification_status === 'verified').length;
  const scored = competitions.filter((item) => item.scores !== null).length;

  return (
    <>
      <PageHeader
        eyebrow="竞赛类别"
        title={domain.label}
        description={domain.description}
        meta={
          <p className="text-sm text-ink-500">
            <strong className="text-ink-900">{competitions.length}</strong> 条收录 ·{' '}
            <strong className="text-ink-900">{verified}</strong> 条已核验 ·{' '}
            <strong className="text-ink-900">{scored}</strong> 条已评分
          </p>
        }
        actions={
          <>
            <ButtonLink to={`/competitions?domain=${domain.id}`} variant="secondary">
              在目录中筛选
            </ButtonLink>
            <Link to="/categories" className="link-inline self-center text-sm">
              全部类别
            </Link>
          </>
        }
      />

      <Container className="py-8">
        <SectionHeading
          eyebrow="收录竞赛"
          title={`${domain.label}方向的竞赛`}
          description="卡片展示核验状态、核验日期与评分状态；未评分或待核验条目不会被写成确定结论。"
        />
        {competitions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {competitions.map((competition) => {
              const ranked = rankMap.get(competition.id);
              return (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  score={ranked?.score}
                  rank={ranked?.rank}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="这个类别还没有收录竞赛"
            description="可以通过提交竞赛草稿补充官方来源；维护者核验后才会进入公开目录。"
            action={<ButtonLink to="/submit-competition">提交竞赛草稿</ButtonLink>}
          />
        )}
      </Container>
    </>
  );
}
