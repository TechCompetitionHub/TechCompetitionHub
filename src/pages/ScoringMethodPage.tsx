import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { ButtonLink } from '../components/Button';
import { Container, PageHeader, SectionHeading } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { Alert } from '../components/States';
import { formatDate } from '../lib/utils/format';
import { getScoringModel } from '../services/scoringService';

export function ScoringMethodPage() {
  usePageMeta({
    title: '评分方法',
    description:
      'TechCompetitionHub 竞赛价值评分的六个维度、权重、公式、缺失数据处理、正式排名准入、并列规则与版本记录。',
  });

  const model = getScoringModel();
  const totalWeight = model.dimensions.reduce((sum, dimension) => sum + dimension.weight, 0);

  return (
    <>
      <PageHeader
        eyebrow="方法论"
        title="竞赛价值评分 v1.0.0"
        description="这是一套公开、可复现的平台方法论，不是官方排名或权威认证。权重、维度依据、缺失数据规则与准入门槛全部公开。"
        actions={
          <ButtonLink to="/rankings" variant="secondary">
            查看价值榜
          </ButtonLink>
        }
      />

      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
          <div className="space-y-10">
            <section aria-labelledby="dimensions-heading">
              <SectionHeading
                id="dimensions-heading"
                eyebrow="维度"
                title="六个维度，权重之和为 1"
                description={`当前模型 v${model.version}，生效日期 ${formatDate(model.effective_from)}；权重合计 ${totalWeight.toFixed(2)}。`}
              />
              <div className="space-y-3">
                {model.dimensions.map((dimension) => (
                  <article
                    key={dimension.id}
                    className="rounded-xl border border-line bg-surface p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-bold text-ink-900">{dimension.name}</h3>
                      <Badge tone="brand">{(dimension.weight * 100).toFixed(0)}%</Badge>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-ink-700">{dimension.description}</p>
                    <p className="mt-2 text-xs leading-5 text-ink-500">
                      评分指引：{dimension.scoring_guidance}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="formula-heading">
              <SectionHeading id="formula-heading" eyebrow="公式" title="总分如何计算" />
              <pre className="overflow-x-auto rounded-xl bg-navy-900 p-4 text-sm leading-6 text-white">
                <code>{`total_score = Σ(dimension_score × dimension_weight)

每个 dimension_score ∈ [0, 100]
Σ dimension_weight = 1`}</code>
              </pre>
              <p className="mt-3 text-sm leading-6 text-ink-700">
                评分数据存储在竞赛记录的 `scores`
                字段，包含每个维度的分数、理由与证据等级，以及模型版本、证据摘要、置信度与复核状态。页面展示的计算结果由同一套纯函数重新计算，不直接信任存储的总分。
              </p>
            </section>

            <section aria-labelledby="missing-heading">
              <SectionHeading
                id="missing-heading"
                eyebrow="缺失数据"
                title="未知不等于 0 分或满分"
              />
              <ul className="space-y-2 text-sm leading-6 text-ink-700">
                <li>· 缺失维度不会被自动记为 0 或 100；</li>
                <li>· 不会悄悄把缺失维度从分母移除后仍使用原始权重；</li>
                <li>· 部分维度已知时只计算“暂定分”，并显示覆盖率，不参与正式排名；</li>
                <li>· 正式排名要求六个维度全部有依据，且证据置信度至少为 medium；</li>
                <li>· 资料不足的条目进入“未进入正式排名”列表，而不是被隐藏。</li>
              </ul>
            </section>

            <section aria-labelledby="eligibility-heading">
              <SectionHeading id="eligibility-heading" eyebrow="准入" title="谁能进入正式排名" />
              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">正式排名准入条件</caption>
                  <thead className="bg-surface-muted text-xs text-ink-500">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        条件
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        要求
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-ink-700">
                    <tr>
                      <th scope="row" className="px-4 py-3 text-left font-medium">
                        数据状态
                      </th>
                      <td className="px-4 py-3">verified，且有官方/机构来源</td>
                    </tr>
                    <tr>
                      <th scope="row" className="px-4 py-3 text-left font-medium">
                        评分复核
                      </th>
                      <td className="px-4 py-3">approved，并记录复核日期与角色</td>
                    </tr>
                    <tr>
                      <th scope="row" className="px-4 py-3 text-left font-medium">
                        置信度
                      </th>
                      <td className="px-4 py-3">至少 medium</td>
                    </tr>
                    <tr>
                      <th scope="row" className="px-4 py-3 text-left font-medium">
                        维度覆盖
                      </th>
                      <td className="px-4 py-3">六个维度全部有分数与理由（覆盖率 100%）</td>
                    </tr>
                    <tr>
                      <th scope="row" className="px-4 py-3 text-left font-medium">
                        时效
                      </th>
                      <td className="px-4 py-3">最后核验时间不超过 18 个月</td>
                    </tr>
                    <tr>
                      <th scope="row" className="px-4 py-3 text-left font-medium">
                        并列
                      </th>
                      <td className="px-4 py-3">同分共享名次，不按名称或更新时间制造差异</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="limits-heading">
              <SectionHeading id="limits-heading" eyebrow="限制" title="这套方法不做什么" />
              <ul className="space-y-2 text-sm leading-6 text-ink-700">
                <li>· 不输出“全国大学生个人综合实力榜”；个人成长案例只做编辑精选；</li>
                <li>· 不把主办方层级、竞赛难度、获奖比例与行业认可混为一个概念；</li>
                <li>· 不把证据等级合成难以理解的“权威指数”；</li>
                <li>· 不使用“官方排名”“全国第一”等误导性标签；</li>
                <li>· 不声称评分能预测保研、就业或获奖结果。</li>
              </ul>
            </section>

            <section aria-labelledby="version-heading">
              <SectionHeading id="version-heading" eyebrow="版本" title="模型变更记录" />
              <ul className="space-y-3">
                {model.changelog.map((entry) => (
                  <li
                    key={`${entry.version}-${entry.date}`}
                    className="rounded-xl border border-line bg-surface p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="brand">v{entry.version}</Badge>
                      <span className="text-xs text-ink-500">{formatDate(entry.date)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink-700">{entry.change}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-5">
            <Alert tone="warning" title="评分不是官方认定">
              平台不是竞赛主办方，也不代表任何官方机构。分数是编辑评估，存在主观性；请结合维度依据、证据等级与自身目标判断。
            </Alert>

            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-sm font-bold text-ink-900">证据等级</h2>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-ink-700">
                <li>
                  <strong>高：</strong>关键事实有官方来源，评分理由与来源齐全。
                </li>
                <li>
                  <strong>中：</strong>关键事实有来源，但部分依据来自估算或社区经验。
                </li>
                <li>
                  <strong>低：</strong>缺少关键来源，不能参与正式排名。
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-line bg-brand-50 p-5">
              <h2 className="text-sm font-bold text-ink-900">如何复现</h2>
              <p className="mt-1 text-xs leading-5 text-ink-700">
                评分引擎是纯函数，位于 <code>src/lib/domain/scoring.ts</code>
                ，并由单元测试覆盖权重、缺失数据、准入与并列规则。
              </p>
              <Link to="/data-policy" className="link-inline mt-3 inline-block text-xs">
                了解数据来源与状态
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
