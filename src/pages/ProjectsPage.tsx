import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { ExternalButton } from '../components/Button';
import { Container, PageHeader } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { EmptyState } from '../components/States';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate } from '../lib/utils/format';
import { getDomainLabel } from '../services/competitionService';
import { listProjects } from '../services/projectService';
import { issueTemplateUrl } from '../services/site';

export function ProjectsPage() {
  usePageMeta({
    title: '项目成果',
    description:
      '展示可复现、有证据链接的竞赛项目成果。提交需获得团队成员同意；平台不为原创性或获奖真实性作保证。',
  });

  const projects = listProjects();

  return (
    <>
      <PageHeader
        eyebrow="项目成果"
        title="用可复现的作品说话"
        description="项目展示的重点不是“看起来厉害”，而是问题、方法、证据、复现步骤与限制。审核状态与官方获奖事实分开记录。"
        meta={
          <p className="text-sm text-ink-500">
            当前收录 {projects.length} 个项目，其中{' '}
            {projects.filter((project) => project.verification_status === 'verified').length}{' '}
            个已核验。
          </p>
        }
        actions={
          <ExternalButton href={issueTemplateUrl('project-submit.yml')}>提交项目</ExternalButton>
        }
      />

      <Container className="py-8">
        {projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.id}
                className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-card"
              >
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={project.verification_status} />
                  {project.domains.slice(0, 2).map((domain) => (
                    <Badge key={domain} tone="brand">
                      {getDomainLabel(domain)}
                    </Badge>
                  ))}
                </div>
                <h2 className="mt-3 text-lg font-bold text-ink-900">
                  <Link to={`/projects/${project.id}`} className="hover:text-brand-700">
                    {project.title}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-ink-500">
                  {project.summary}
                </p>
                <div className="mt-4 border-t border-line pt-3 text-xs text-ink-500">
                  核验 {formatDate(project.last_verified_at)} · {project.technologies.length} 项技术
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="还没有已收录的项目成果"
            description="平台不会用示例项目冒充真实成果。项目提交需要提供问题、方法、复现步骤、证据链接、许可证与成员同意记录；审核通过后才会公开展示。"
            action={
              <ExternalButton href={issueTemplateUrl('project-submit.yml')}>
                按模板提交项目
              </ExternalButton>
            }
          />
        )}

        <section className="mt-10 grid gap-4 rounded-2xl border border-line bg-surface p-6 sm:grid-cols-3">
          <div>
            <h2 className="text-sm font-bold text-ink-900">需要准备什么</h2>
            <p className="mt-1 text-xs leading-5 text-ink-500">
              项目目标、技术栈、角色与贡献、仓库/演示/文档链接、复现步骤、结果、局限与许可证。
            </p>
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink-900">审核什么</h2>
            <p className="mt-1 text-xs leading-5 text-ink-500">
              链接可访问、复现步骤完整、证据与声明一致、成员同意发布、无未授权材料。
            </p>
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink-900">不做什么</h2>
            <p className="mt-1 text-xs leading-5 text-ink-500">
              不替项目背书原创性，不推断获奖真实性，不把审核状态等同于官方认证。
            </p>
          </div>
        </section>
      </Container>
    </>
  );
}
