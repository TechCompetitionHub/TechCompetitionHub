import { ButtonLink, ExternalButton } from '../components/Button';
import { Container, PageHeader, SectionHeading } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { Alert } from '../components/States';
import { ExternalLink } from '../components/ExternalLink';
import { SITE, issueTemplateUrl } from '../services/site';

const STEPS = [
  {
    title: '1. 先提 Issue',
    description:
      '新增竞赛、纠错、项目提交、技能/资源建议分别使用对应模板。写清来源、访问日期与仍未知的字段。',
  },
  {
    title: '2. 本地修改数据',
    description:
      '数据在 data/ 下逐条 JSON；内容在 content/guides/ 下 Markdown。文件名与 ID 必须一致。',
  },
  {
    title: '3. 运行检查',
    description: '格式、Lint、类型、测试、数据校验、Schema 漂移检查与生产构建全部通过后再提交 PR。',
  },
  {
    title: '4. 审核与合并',
    description:
      '维护者核对来源、时效性与版权；评分变更需说明理由。合并后自动部署，重要变化写入 CHANGELOG。',
  },
];

export function ContributePage() {
  usePageMeta({
    title: '参与贡献',
    description:
      '通过 Issue 与 Pull Request 贡献竞赛数据、项目、技能与代码。包含本地检查命令、数据规则、审核流程与安全报告渠道。',
  });

  return (
    <>
      <PageHeader
        eyebrow="参与贡献"
        title="修正一条事实，比写一句口号更有用"
        description="平台通过 Issue 与 PR 管理数据、内容与代码。CI 会拦截结构错误、重复 ID、无效引用、技能依赖环、评分权重错误与构建失败。"
        actions={
          <>
            <ExternalButton href={SITE.issues}>打开 Issue</ExternalButton>
            <ButtonLink to="/data-policy" variant="secondary">
              先读数据政策
            </ButtonLink>
          </>
        }
      />

      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
          <div className="space-y-10">
            <section aria-labelledby="flow-heading">
              <SectionHeading id="flow-heading" eyebrow="流程" title="从 Issue 到合并" />
              <ol className="space-y-3">
                {STEPS.map((step) => (
                  <li key={step.title} className="rounded-xl border border-line bg-surface p-4">
                    <h3 className="font-semibold text-ink-900">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-ink-500">{step.description}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="commands-heading">
              <SectionHeading
                id="commands-heading"
                eyebrow="本地验证"
                title="提交前运行同一套检查"
                description="需要 Node.js LTS。使用锁文件安装，避免不可重复依赖。"
              />
              <pre className="overflow-x-auto rounded-xl bg-navy-900 p-4 text-sm leading-6 text-white">
                <code>{`npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run data:validate
npm run data:schemas:check
npm run build`}</code>
              </pre>
              <p className="mt-2 text-xs leading-5 text-ink-500">
                `npm run check`
                会按顺序执行上述检查（包含构建）。外部链接在线检查单独运行，不阻断常规 PR。
              </p>
            </section>

            <section aria-labelledby="data-rules-heading">
              <SectionHeading id="data-rules-heading" eyebrow="数据规则" title="未知就写未知" />
              <ul className="space-y-2 text-sm leading-6 text-ink-700">
                <li>· 公开事实必须有来源、访问日期与最后核验日期；</li>
                <li>· 未知日期/文本用 null，未知评分用 null，不得用 0 或 100 代替；</li>
                <li>· verified 条目至少有一个 official/organizer/institutional 来源；</li>
                <li>· 示例数据只能放在 data/examples/，必须标记 is_example；</li>
                <li>· 技能前置关系不得成环，练习任务必须有验收标准；</li>
                <li>· 评分权重之和必须为 1，维度分必须在 0–100；</li>
                <li>· 不提交未授权图片、题目、论文、课程材料或他人代码。</li>
              </ul>
              <p className="mt-3 text-xs leading-5 text-ink-500">
                详细字段说明见仓库 <code>docs/DATA_MODEL.md</code>；提交模板见{' '}
                <ExternalLink
                  href={`${SITE.repo}/tree/main/.github/ISSUE_TEMPLATE`}
                  className="text-xs"
                >
                  .github/ISSUE_TEMPLATE
                </ExternalLink>
                。
              </p>
            </section>

            <section aria-labelledby="reject-heading">
              <SectionHeading id="reject-heading" eyebrow="审核" title="常见退回原因" />
              <ul className="grid gap-2 sm:grid-cols-2">
                {[
                  '只有二手介绍，没有官方来源',
                  '把往年日期写成当年确定日期',
                  '用 0 分表示“不知道”',
                  '引用不存在的技能或资源 ID',
                  '示例数据放进正式目录',
                  '提交未授权材料或个人信息',
                  '评分没有维度依据或复核记录',
                  'PR 混入无关改动，难以审查',
                ].map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="templates-heading">
              <SectionHeading id="templates-heading" eyebrow="模板" title="选择正确的入口" />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['新增竞赛', 'competition-add.yml'],
                  ['竞赛信息纠错', 'competition-correction.yml'],
                  ['项目提交', 'project-submit.yml'],
                  ['技能/资源建议', 'skill-resource-suggestion.yml'],
                  ['缺陷报告', 'bug-report.yml'],
                ].map(([label, template]) => (
                  <ExternalButton
                    key={template}
                    href={issueTemplateUrl(template)}
                    variant="secondary"
                    size="sm"
                    className="justify-between"
                  >
                    {label}
                    <span aria-hidden="true">↗</span>
                  </ExternalButton>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-sm font-bold text-ink-900">贡献前请确认</h2>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-ink-700">
                <li>· 你拥有所提交内容的发布权限；</li>
                <li>· 涉及队友的项目与角色已获得同意；</li>
                <li>· 不包含手机号、身份证、住址等敏感信息；</li>
                <li>· 不包含密钥、令牌或私有数据；</li>
                <li>· 同意以仓库许可证发布你的贡献。</li>
              </ul>
            </div>

            <Alert tone="danger" title="安全漏洞请私下报告">
              不要在公开 Issue 中贴出可利用细节、真实凭据或个人数据。请按 SECURITY.md
              中的私密渠道报告。
              <ExternalLink
                href={`${SITE.repo}/blob/main/SECURITY.md`}
                className="mt-2 block text-xs"
              >
                阅读 SECURITY.md
              </ExternalLink>
            </Alert>

            <div className="rounded-2xl border border-line bg-brand-50 p-5">
              <h2 className="text-sm font-bold text-ink-900">行为准则</h2>
              <p className="mt-1 text-xs leading-5 text-ink-700">
                有证据的批评与不同意见是欢迎的；人身攻击、伪造、代做、买卖奖项与未经授权材料会被移除。
              </p>
              <ExternalLink
                href={`${SITE.repo}/blob/main/CODE_OF_CONDUCT.md`}
                className="mt-3 inline-block text-xs"
              >
                阅读 CODE_OF_CONDUCT.md
              </ExternalLink>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-sm font-bold text-ink-900">讨论而不是争论</h2>
              <p className="mt-1 text-xs leading-5 text-ink-500">
                评分方法争议进入 Discussions 并记录观点；事实错误优先修正。
              </p>
              <ExternalLink href={SITE.discussions} className="mt-3 inline-block text-xs">
                GitHub Discussions
              </ExternalLink>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
