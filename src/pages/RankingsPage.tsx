import { Link, useSearchParams } from 'react-router-dom';
import { Alert } from '../components/States';
import { Badge } from '../components/Badge';
import { ButtonLink } from '../components/Button';
import { Field, Select } from '../components/Fields';
import { Container, PageHeader, SectionHeading } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { EmptyState } from '../components/States';
import { RankingEntry } from '../features/rankings/RankingEntry';
import { formatDate, formatScore } from '../lib/utils/format';
import { getDomainOptions, getValueRanking } from '../services/competitionService';
import { getScoringModel } from '../services/scoringService';

export function RankingsPage() {
  usePageMeta({
    title: '竞赛价值榜',
    description:
      '按公开的六维评分模型与准入规则生成竞赛价值榜，展示维度分、模型版本、证据状态与核验日期。未满足条件的条目不进入正式排名。',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const domain = searchParams.get('domain') ?? '';
  const ranking = getValueRanking(domain || null);
  const model = getScoringModel();
  const domains = getDomainOptions();
  const domainLabel = domains.find((item) => item.id === domain)?.label;

  return (
    <>
      <PageHeader
        eyebrow="排行榜"
        title="竞赛价值榜"
        description="总分只对满足准入条件的条目计算。权重、维度依据、评分版本与核验日期全部公开；资料不足的条目不参与正式排名。"
        meta={
          <p className="text-sm text-ink-500">
            模型 v{model.version} · 生效 {formatDate(model.effective_from)} ·{' '}
            {ranking.entries.length} 条正式排名 · {ranking.excluded.length} 条未进入
          </p>
        }
        actions={
          <ButtonLink to="/scoring-method" variant="secondary">
            评分方法
          </ButtonLink>
        }
      />

      <Container className="py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:flex-row sm:items-end sm:justify-between">
              <Field label="按领域筛选" htmlFor="ranking-domain" className="sm:max-w-xs">
                <Select
                  id="ranking-domain"
                  value={domain}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value) {
                      setSearchParams({ domain: value }, { replace: true });
                    } else {
                      setSearchParams({}, { replace: true });
                    }
                  }}
                >
                  <option value="">全部领域（跨领域比较需谨慎）</option>
                  {domains
                    .filter((item) => item.count > 0)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}（{item.count}）
                      </option>
                    ))}
                </Select>
              </Field>
              <p className="max-w-md text-xs leading-5 text-ink-500">
                领域筛选会改变比较范围与名次。跨领域简单比较容易误导，建议先确定目标方向。
              </p>
            </div>

            <h2 className="sr-only">排名结果</h2>
            {ranking.entries.length > 0 ? (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-ink-900">
                    {domainLabel ? `${domainLabel} · 正式排名` : '全部领域 · 正式排名'}
                  </h2>
                  <Badge tone="success">正式评分</Badge>
                </div>
                <ol className="space-y-4">
                  {ranking.entries.map((entry) => (
                    <li key={entry.competition.id}>
                      <RankingEntry entry={entry} />
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <EmptyState
                title="暂无满足准入条件的条目"
                description="正式排名要求数据已核验、评分已审核、六个维度都有依据，且核验时间在有效期内。平台不会用暂定分或虚构分数填充榜单。"
                action={
                  <ButtonLink to="/competitions" variant="secondary">
                    浏览竞赛目录
                  </ButtonLink>
                }
              />
            )}

            <section className="mt-10" aria-labelledby="excluded-heading">
              <SectionHeading
                id="excluded-heading"
                eyebrow="准入与缺失"
                title="未进入正式排名的条目"
                description="未满足准入条件的条目单独展示，并给出具体原因。暂定分不参与排名，也不与正式分混排。"
              />
              {ranking.excluded.length > 0 ? (
                <ul className="space-y-3">
                  {ranking.excluded.map((item) => (
                    <li
                      key={item.competition.id}
                      className="rounded-xl border border-line bg-surface p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link
                          to={`/competitions/${item.competition.id}`}
                          className="font-semibold text-ink-900 hover:text-brand-700"
                        >
                          {item.competition.name}
                        </Link>
                        <div className="flex items-center gap-2">
                          {item.status === 'provisional' ? (
                            <Badge tone="warning">
                              暂定分 {formatScore(item.provisionalScore)} · 覆盖率{' '}
                              {Math.round(item.coverage * 100)}%
                            </Badge>
                          ) : (
                            <Badge tone="neutral">资料不足</Badge>
                          )}
                        </div>
                      </div>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-ink-500">
                        {item.reasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-line bg-surface p-4 text-sm text-ink-500">
                  当前筛选范围内所有已评分条目都满足正式排名准入条件。
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
              <h2 className="text-sm font-bold text-ink-900">评分维度与权重</h2>
              <div className="mt-3 space-y-3">
                {model.dimensions.map((dimension) => (
                  <div key={dimension.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-ink-700">{dimension.name}</span>
                      <span className="text-sm font-semibold text-ink-900">
                        {(dimension.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-5 text-ink-500">{dimension.description}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 border-t border-line pt-3 text-xs leading-5 text-ink-500">
                权重之和为 1。未知维度不会被当作 0 分；资料不足的条目不进入正式排名。
              </p>
            </div>

            <Alert tone="warning" title="这不是官方排名">
              平台评分是社区方法论下的编辑初评，不是主办方认定、官方排名或对个人结果的预测。不同领域、不同年份之间不宜简单比较。
            </Alert>

            <div className="rounded-2xl border border-line bg-brand-50 p-5">
              <h2 className="text-sm font-bold text-ink-900">准入规则</h2>
              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-ink-700">
                <li>· 数据状态为 verified，且有官方/机构来源；</li>
                <li>· 评分已审核，置信度至少为 medium；</li>
                <li>· 六个维度全部有分数与依据；</li>
                <li>· 最后核验时间在 18 个月内；</li>
                <li>· 同分并列，不按名称或更新时间制造差异。</li>
              </ul>
              <Link to="/scoring-method" className="link-inline mt-3 inline-block text-xs">
                查看完整规则与版本记录
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
