import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Button, ButtonLink } from '../components/Button';
import { Field, Select, TextInput } from '../components/Fields';
import { Container, PageHeader } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { EmptyState } from '../components/States';
import { CompetitionCard } from '../features/competitions/CompetitionCard';
import {
  activeFilterCount,
  DEFAULT_FILTERS,
  filterCompetitions,
  filtersToSearchParams,
  parseCompetitionFilters,
  type CompetitionFilters,
} from '../lib/domain/search';
import {
  getAudienceOptions,
  getCostOptions,
  getDifficultyOptions,
  getDomainOptions,
  getFormatOptions,
  getScoreMap,
  getStatusOptions,
  listCompetitions,
} from '../services/competitionService';

export function CompetitionCatalogPage() {
  usePageMeta({
    title: '竞赛目录',
    description:
      '按领域、适合对象、难度、形式和费用筛选大学生科技竞赛。筛选条件保存在 URL 中，可分享与刷新恢复。',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseCompetitionFilters(searchParams), [searchParams]);
  const competitions = listCompetitions();
  const domains = getDomainOptions();
  const audiences = getAudienceOptions();
  const difficulties = getDifficultyOptions();
  const formats = getFormatOptions();
  const costs = getCostOptions();
  const statuses = getStatusOptions();
  const scoreMap = useMemo(() => getScoreMap(), []);
  const results = useMemo(
    () => filterCompetitions(competitions, filters, { scoreById: scoreMap }),
    [competitions, filters, scoreMap],
  );
  const active = activeFilterCount(filters);

  const update = (key: keyof CompetitionFilters, value: string) => {
    const next = { ...filters, [key]: value };
    setSearchParams(filtersToSearchParams(next), { replace: true });
  };

  return (
    <>
      <PageHeader
        eyebrow="找竞赛"
        title="竞赛目录"
        description="按真实数据筛选，而不是按宣传语排序。每条记录标注核验状态、最后核验日期与评分状态；未知信息显示为“待核验”。"
        meta={
          <p className="text-sm text-ink-500">
            共 <strong className="text-ink-900">{competitions.length}</strong> 条公开数据，其中{' '}
            <strong className="text-ink-900">
              {competitions.filter((item) => item.verification_status === 'verified').length}
            </strong>{' '}
            条已核验。
          </p>
        }
        actions={
          <>
            <ButtonLink to="/categories" variant="secondary">
              按类别浏览
            </ButtonLink>
            <ButtonLink to="/submit-competition" variant="ghost">
              提交竞赛
            </ButtonLink>
          </>
        }
      />

      <Container className="py-8">
        <form
          className="rounded-2xl border border-line bg-surface p-5 shadow-card"
          onSubmit={(event) => event.preventDefault()}
          aria-label="竞赛筛选"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field
              label="关键词"
              htmlFor="filter-q"
              hint="竞赛名、简称、领域或主办方"
              className="sm:col-span-2"
            >
              <TextInput
                id="filter-q"
                type="search"
                value={filters.q}
                onChange={(event) => update('q', event.target.value)}
                placeholder="例如：嵌入式、数学建模、机器人"
              />
            </Field>

            <Field label="领域" htmlFor="filter-domain">
              <Select
                id="filter-domain"
                value={filters.domain}
                onChange={(event) => update('domain', event.target.value)}
              >
                <option value="">全部领域</option>
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.label}（{domain.count}）
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="适合对象" htmlFor="filter-audience">
              <Select
                id="filter-audience"
                value={filters.audience}
                onChange={(event) => update('audience', event.target.value)}
              >
                <option value="">全部对象</option>
                {audiences.map((audience) => (
                  <option key={audience.id} value={audience.id}>
                    {audience.label}（{audience.count}）
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="难度" htmlFor="filter-difficulty">
              <Select
                id="filter-difficulty"
                value={filters.difficulty}
                onChange={(event) => update('difficulty', event.target.value)}
              >
                <option value="">全部难度</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="参赛形式" htmlFor="filter-format">
              <Select
                id="filter-format"
                value={filters.format}
                onChange={(event) => update('format', event.target.value)}
              >
                <option value="">全部形式</option>
                {formats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="费用状态" htmlFor="filter-cost">
              <Select
                id="filter-cost"
                value={filters.cost}
                onChange={(event) => update('cost', event.target.value)}
              >
                <option value="">全部费用状态</option>
                {costs.map((cost) => (
                  <option key={cost.value} value={cost.value}>
                    {cost.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="数据状态" htmlFor="filter-status">
              <Select
                id="filter-status"
                value={filters.status}
                onChange={(event) => update('status', event.target.value)}
              >
                <option value="">全部状态</option>
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="排序" htmlFor="filter-sort">
              <Select
                id="filter-sort"
                value={filters.sort}
                onChange={(event) => update('sort', event.target.value)}
              >
                <option value="recommended">推荐排序</option>
                <option value="name">名称</option>
                <option value="difficulty-asc">难度从低到高</option>
                <option value="difficulty-desc">难度从高到低</option>
                <option value="verified-desc">最近核验</option>
                <option value="score-desc">平台评分</option>
              </Select>
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <p className="text-xs text-ink-500">
              筛选条件写入 URL，可直接复制分享；刷新后自动恢复。
            </p>
            <div className="flex items-center gap-2">
              {active > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchParams(filtersToSearchParams(DEFAULT_FILTERS))}
                >
                  清除 {active} 个筛选
                </Button>
              ) : null}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSearchParams(filtersToSearchParams(DEFAULT_FILTERS))}
              >
                重置
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm text-ink-700">
            找到 <strong>{results.length}</strong> 条结果
            {filters.q ? `（关键词：${filters.q}）` : ''}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {filters.domain ? (
              <Badge tone="brand">
                {domains.find((domain) => domain.id === filters.domain)?.label ?? filters.domain}
              </Badge>
            ) : null}
            {filters.audience ? (
              <Badge tone="brand">
                {audiences.find((audience) => audience.id === filters.audience)?.label ??
                  filters.audience}
              </Badge>
            ) : null}
            {filters.difficulty ? <Badge tone="brand">难度 {filters.difficulty}</Badge> : null}
            {filters.format ? <Badge tone="brand">{filters.format}</Badge> : null}
            {filters.status ? <Badge tone="brand">{filters.status}</Badge> : null}
          </div>
        </div>

        <h2 className="sr-only">竞赛列表</h2>
        {results.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((competition) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                score={scoreMap.get(competition.id)}
              />
            ))}
          </div>
        ) : competitions.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="暂无公开竞赛数据"
              description="仓库还没有通过 Schema 校验的公开竞赛条目。请按贡献指南提交数据；平台不会用虚构数据填充目录。"
              action={
                <Button
                  onClick={() => setSearchParams(filtersToSearchParams(DEFAULT_FILTERS))}
                  variant="secondary"
                >
                  清除筛选
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="没有符合筛选条件的竞赛"
              description="可以尝试减少筛选条件，或换一个领域关键词。当前目录中的每一条数据都有来源与核验状态，不会为了填满结果而生成占位条目。"
              action={
                <Button
                  onClick={() => setSearchParams(filtersToSearchParams(DEFAULT_FILTERS))}
                  variant="secondary"
                >
                  查看全部竞赛
                </Button>
              }
            />
          </div>
        )}
      </Container>
    </>
  );
}
