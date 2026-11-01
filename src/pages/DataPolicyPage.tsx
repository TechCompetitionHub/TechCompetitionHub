import { Link } from 'react-router-dom';
import { ButtonLink } from '../components/Button';
import { Container, PageHeader, SectionHeading } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { Alert } from '../components/States';
import { ExternalLink } from '../components/ExternalLink';
import { SITE } from '../services/site';
import { countVerifiedCompetitions, listCompetitions } from '../services/competitionService';

const STATUS_ROWS = [
  ['draft', '草稿', '尚在整理，不作为公开事实展示。'],
  ['needs_review', '待核验', '已录入但关键事实尚未完成交叉核对。'],
  ['verified', '已核验', '关键事实有可访问来源，并记录最后核验日期。'],
  ['stale', '可能过期', '距上次核验时间较久，使用前应重新确认。'],
  ['rejected', '已拒绝', '来源不足、重复或不符合平台规则，不公开展示。'],
];

export function DataPolicyPage() {
  usePageMeta({
    title: '数据政策',
    description: '竞赛数据的来源、核验状态、未知值处理、示例数据隔离、纠错流程与许可说明。',
  });

  const competitions = listCompetitions();

  return (
    <>
      <PageHeader
        eyebrow="透明与治理"
        title="数据政策"
        description="平台宁缺毋滥：没有来源的事实不写成确定信息，未知字段显示“待核验”，示例数据不进入公开目录或排行榜。"
        actions={
          <ButtonLink to="/contribute" variant="secondary">
            参与纠错
          </ButtonLink>
        }
      />

      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
          <div className="space-y-10">
            <section aria-labelledby="principles-heading">
              <SectionHeading id="principles-heading" eyebrow="原则" title="事实、经验与评分分开" />
              <div className="space-y-3 text-sm leading-7 text-ink-700">
                <p>
                  <strong className="text-ink-900">事实：</strong>
                  竞赛名称、主办方、资格、时间、费用等来自官方或机构来源，记录
                  URL、访问日期与支持的字段。
                </p>
                <p>
                  <strong className="text-ink-900">经验：</strong>
                  指南与复盘是社区观点，明确标注作者与更新时间，不替代官方规则。
                </p>
                <p>
                  <strong className="text-ink-900">评分：</strong>
                  平台评分是编辑初评，带维度依据、证据等级、模型版本与复核记录，不是官方排名。
                </p>
              </div>
            </section>

            <section aria-labelledby="status-heading">
              <SectionHeading id="status-heading" eyebrow="状态" title="五种数据状态" />
              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">数据状态定义</caption>
                  <thead className="bg-surface-muted text-xs text-ink-500">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        状态
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        含义
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {STATUS_ROWS.map(([id, label, description]) => (
                      <tr key={id}>
                        <th scope="row" className="px-4 py-3 text-left align-top">
                          <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">
                            {id}
                          </code>
                          <span className="mt-1 block text-xs text-ink-500">{label}</span>
                        </th>
                        <td className="px-4 py-3 leading-6 text-ink-700">{description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs leading-5 text-ink-500">
                `verified` 不等于“所有字段永远正确”。关键事实仍可能变化，使用前请回到官方来源。
              </p>
            </section>

            <section aria-labelledby="unknown-heading">
              <SectionHeading
                id="unknown-heading"
                eyebrow="未知值"
                title="null、空数组与“待核验”"
              />
              <ul className="space-y-2 text-sm leading-6 text-ink-700">
                <li>· 未知文本/日期：`null`，页面显示“待核验”；</li>
                <li>· 未知数值：`null`，不参与正式排名；</li>
                <li>· 未知列表：空数组；</li>
                <li>· 未知评分：`scores: null`，绝不写成 0 或 100；</li>
                <li>· 只有年份或周期：写在备注中，不伪造具体日期。</li>
              </ul>
            </section>

            <section aria-labelledby="verification-heading">
              <SectionHeading
                id="verification-heading"
                eyebrow="核验"
                title="一条数据如何变成 verified"
              />
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-ink-700">
                <li>找到官方竞赛网站、章程或组委会通知；</li>
                <li>核对名称、主办/承办、资格、形式与可确认的时间；</li>
                <li>记录来源 URL、发布方、访问日期与支持字段；</li>
                <li>交叉检查关键事实，冲突时保留说明而不是任选其一；</li>
                <li>填写 `last_verified_at`，把无法确认的字段保持未知；</li>
                <li>通过 Schema、引用关系与构建校验后提交 PR。</li>
              </ol>
              <Alert tone="info" className="mt-4">
                首版竞赛条目在 2026-11-01
                按上述流程核对官网页面。评分是平台编辑初评，维护者与领域评审仍需复核；页面已标注证据等级与限制。
              </Alert>
            </section>

            <section aria-labelledby="examples-heading">
              <SectionHeading id="examples-heading" eyebrow="示例" title="示例数据与正式数据隔离" />
              <p className="text-sm leading-6 text-ink-700">
                示例文件位于 `data/examples/`，必须设置 `is_example: true`，不得标记为
                verified，也不会被公开 Repository 或排行榜加载。测试 fixture 同样不进入生产数据。
              </p>
            </section>

            <section aria-labelledby="correction-heading">
              <SectionHeading id="correction-heading" eyebrow="纠错" title="发现错误怎么办" />
              <p className="text-sm leading-6 text-ink-700">
                请通过纠错 Issue
                提供字段、当前值、建议值与来源。事实错误优先修正；评分争议进入公开讨论并记录观点；重要事实变化写入
                CHANGELOG。
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-700">
                当前公开竞赛 {competitions.length} 条，其中 {countVerifiedCompetitions()} 条已核验。
              </p>
            </section>

            <section aria-labelledby="license-heading">
              <SectionHeading id="license-heading" eyebrow="许可" title="只引用链接，不擅自转载" />
              <p className="text-sm leading-6 text-ink-700">
                平台保存标题、简介与原始链接，不复制课程、论文、题库或他人作品。第三方材料遵循原许可证；代码与原创文档的许可证由维护者最终确认。
              </p>
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-sm font-bold text-ink-900">快速链接</h2>
              <ul className="mt-2 space-y-2 text-sm">
                <li>
                  <Link to="/scoring-method" className="link-inline">
                    评分方法
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="link-inline">
                    隐私说明
                  </Link>
                </li>
                <li>
                  <Link to="/contribute" className="link-inline">
                    贡献指南
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="link-inline">
                    关于本站
                  </Link>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-sm font-bold text-ink-900">数据责任</h2>
              <p className="mt-1 text-xs leading-5 text-ink-500">
                平台不是主办方或官方信息发布渠道。报名、费用、资格与规则以主办方当届通知为准。
              </p>
              <ExternalLink href={SITE.repo} className="mt-3 inline-block text-xs">
                查看数据文件
              </ExternalLink>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
