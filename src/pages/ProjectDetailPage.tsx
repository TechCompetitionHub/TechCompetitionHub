import { Link, useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { ExternalLink } from '../components/ExternalLink';
import { Breadcrumbs, Container, PageHeader, SectionHeading } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { Alert } from '../components/States';
import { StatusBadge } from '../components/StatusBadge';
import { NotFoundPage } from './NotFoundPage';
import { formatDate } from '../lib/utils/format';
import { getDomainLabel } from '../services/competitionService';
import { getProjectById, getProjectCompetitions } from '../services/projectService';

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const project = projectId ? getProjectById(projectId) : undefined;

  if (!project) {
    return <NotFoundPage />;
  }

  const competitions = getProjectCompetitions(project.id);

  return (
    <>
      <ProjectMeta title={project.title} summary={project.summary} />
      <PageHeader
        eyebrow="项目成果"
        title={project.title}
        description={project.summary}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={project.verification_status} />
            {project.domains.map((domain) => (
              <Badge key={domain} tone="brand">
                {getDomainLabel(domain)}
              </Badge>
            ))}
            <span className="text-xs text-ink-500">
              最后核验：{formatDate(project.last_verified_at)}
            </span>
          </div>
        }
      />

      <Container className="py-8">
        <Breadcrumbs
          items={[
            { label: '首页', to: '/' },
            { label: '项目成果', to: '/projects' },
            { label: project.title },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
          <div className="space-y-8">
            <section aria-labelledby="problem-heading">
              <SectionHeading id="problem-heading" eyebrow="问题与方案" title="解决了什么问题" />
              <div className="space-y-4 text-sm leading-7 text-ink-700">
                <p>
                  <strong className="text-ink-900">问题：</strong>
                  {project.problem_statement}
                </p>
                <p>
                  <strong className="text-ink-900">方法：</strong>
                  {project.approach}
                </p>
              </div>
            </section>

            <section aria-labelledby="repro-heading">
              <SectionHeading
                id="repro-heading"
                eyebrow="复现"
                title="运行环境与验证方法"
                description="项目展示不等于平台对原创性、质量或获奖真实性作出保证；请以证据链接与复现记录为准。"
              />
              <dl className="space-y-4 rounded-xl border border-line bg-surface p-5 text-sm leading-6">
                <div>
                  <dt className="font-semibold text-ink-900">环境</dt>
                  <dd className="mt-1 text-ink-700">{project.reproducibility.environment}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink-900">依赖</dt>
                  <dd className="mt-1 text-ink-700">
                    {project.reproducibility.dependencies.length > 0
                      ? project.reproducibility.dependencies.join('、')
                      : '未列出'}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink-900">运行步骤</dt>
                  <dd className="mt-1">
                    <ol className="list-decimal space-y-1 pl-5 text-ink-700">
                      {project.reproducibility.run_steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink-900">测试方法</dt>
                  <dd className="mt-1 text-ink-700">{project.reproducibility.test_method}</dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="results-heading">
              <SectionHeading id="results-heading" eyebrow="结果与限制" title="不要只写成功" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-surface p-4">
                  <h3 className="text-sm font-bold text-ink-900">结果</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-700">{project.results}</p>
                </div>
                <div className="rounded-xl border border-line bg-surface p-4">
                  <h3 className="text-sm font-bold text-ink-900">局限</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-700">{project.limitations}</p>
                </div>
              </div>
            </section>

            <section aria-labelledby="evidence-heading">
              <SectionHeading id="evidence-heading" eyebrow="证据" title="公开可检查的链接" />
              {project.evidence_urls.length > 0 ? (
                <ul className="space-y-2">
                  {project.evidence_urls.map((url) => (
                    <li key={url}>
                      <ExternalLink href={url}>{url}</ExternalLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-500">未提供证据链接，项目的可核验性有限。</p>
              )}
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
              <h2 className="text-sm font-bold text-ink-900">项目链接</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {project.repository_url ? (
                  <li>
                    <ExternalLink href={project.repository_url}>代码仓库</ExternalLink>
                  </li>
                ) : null}
                {project.demo_url ? (
                  <li>
                    <ExternalLink href={project.demo_url}>演示</ExternalLink>
                  </li>
                ) : null}
                {project.documentation_url ? (
                  <li>
                    <ExternalLink href={project.documentation_url}>文档</ExternalLink>
                  </li>
                ) : null}
                {!project.repository_url && !project.demo_url && !project.documentation_url ? (
                  <li className="text-ink-500">未提供公开链接</li>
                ) : null}
              </ul>

              <h2 className="mt-5 border-t border-line pt-4 text-sm font-bold text-ink-900">
                关联竞赛
              </h2>
              {competitions.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {competitions.map((competition) => (
                    <li key={competition.id}>
                      <Link to={`/competitions/${competition.id}`} className="link-inline text-sm">
                        {competition.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink-500">未关联竞赛。</p>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-sm font-bold text-ink-900">团队贡献</h2>
              {project.team_contributions.length > 0 ? (
                <ul className="mt-2 space-y-3">
                  {project.team_contributions.map((contribution) => (
                    <li key={`${contribution.role}-${contribution.contributor_handle ?? ''}`}>
                      <p className="text-sm font-semibold text-ink-900">{contribution.role}</p>
                      <p className="text-xs text-ink-500">
                        {contribution.contributor_handle ?? '未公开 handle'} · 已确认发布同意
                      </p>
                      <p className="mt-1 text-xs leading-5 text-ink-700">
                        {contribution.contribution}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink-500">未提供团队贡献信息。</p>
              )}
              <p className="mt-4 text-xs leading-5 text-ink-500">许可证：{project.license}</p>
            </div>

            <Alert tone="warning" title="展示不等于认证">
              平台不保证项目原创性、质量或获奖真实性。审核状态只表示项目资料与证据链接已按清单核对。
            </Alert>
          </aside>
        </div>
      </Container>
    </>
  );
}

function ProjectMeta({ title, summary }: { title: string; summary: string }) {
  usePageMeta({
    title,
    description: `${summary} 查看复现步骤、证据链接、团队贡献与许可证信息。`,
  });
  return null;
}
