import { Link, useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { ButtonLink, ExternalButton } from '../components/Button';
import { Container, PageHeader, SectionHeading } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { ExternalLink } from '../components/ExternalLink';
import { SourceList } from '../components/SourceList';
import {
  PREFERENCE_STATUS_DESCRIPTIONS,
  PREFERENCE_STATUS_LABELS,
  type PreferenceStatus,
} from '../lib/domain/careers';
import { getCompanyById, getCompetitionName, getJobRoleLabel } from '../services/careerService';
import { issueTemplateUrl } from '../services/site';

const PREFERENCE_TONE: Record<PreferenceStatus, 'success' | 'info' | 'warning' | 'neutral'> = {
  direct_channel: 'success',
  priority: 'info',
  plus: 'warning',
  no_public_channel: 'neutral',
  unknown: 'neutral',
};

export function CompanyDetailPage() {
  const { companyId = '' } = useParams();
  const company = getCompanyById(companyId);

  usePageMeta({
    title: company ? `${company.name} 求职信息` : '企业不存在',
    description: company
      ? `${company.name} 的岗位方向、校园招聘入口与竞赛直通/优先条款；只记录有公开来源的信息。`
      : '这个企业不存在。',
  });

  if (!company) {
    return (
      <Container className="py-16">
        <p className="text-sm font-semibold text-brand-700">404</p>
        <h1 className="mt-2 text-3xl font-bold text-ink-900">这个企业不存在</h1>
        <p className="mt-3 text-sm leading-6 text-ink-500">
          企业信息来自公开数据；请返回求职地图选择现有企业。
        </p>
        <ButtonLink to="/careers" className="mt-6">
          返回求职地图
        </ButtonLink>
      </Container>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="企业与岗位"
        title={company.name}
        description={company.industry}
        meta={
          <div className="flex flex-wrap gap-2">
            {company.role_ids.map((roleId) => (
              <Badge key={roleId} tone="brand">
                {getJobRoleLabel(roleId)}
              </Badge>
            ))}
          </div>
        }
        actions={
          <>
            <ExternalButton href={company.careers_url}>官方校招入口</ExternalButton>
            <ButtonLink to="/careers" variant="secondary">
              返回求职地图
            </ButtonLink>
          </>
        }
      />

      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
          <div className="space-y-8">
            <section aria-labelledby="preferences-heading">
              <SectionHeading
                id="preferences-heading"
                eyebrow="竞赛与招聘"
                title="公开的直通、优先与加分条款"
                description="没有官方依据的条款标为“待核验”；不把“参赛经历”写成“保证录用”。"
              />
              {company.competition_preferences.length > 0 ? (
                <ul className="space-y-4">
                  {company.competition_preferences.map((preference) => (
                    <li
                      key={`${preference.competition_id}-${preference.status}`}
                      className="rounded-2xl border border-line bg-surface p-5 shadow-card"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-bold text-ink-900">
                          <Link
                            to={`/competitions/${preference.competition_id}`}
                            className="hover:text-brand-700"
                          >
                            {getCompetitionName(preference.competition_id)}
                          </Link>
                        </h3>
                        <Badge tone={PREFERENCE_TONE[preference.status]}>
                          {PREFERENCE_STATUS_LABELS[preference.status]}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-ink-700">{preference.statement}</p>
                      <p className="mt-2 text-xs leading-5 text-ink-500">
                        {PREFERENCE_STATUS_DESCRIPTIONS[preference.status]}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                        <ExternalLink href={preference.source_url}>官方来源</ExternalLink>
                        <span className="text-ink-500">访问日期 {preference.accessed_at}</span>
                      </div>
                      {preference.notes ? (
                        <p className="mt-2 text-xs leading-5 text-ink-500">{preference.notes}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-line bg-surface p-4 text-sm text-ink-500">
                  暂无公开的竞赛直通/优先条款。
                </p>
              )}
            </section>

            {company.hiring_programs.length > 0 ? (
              <section aria-labelledby="programs-heading">
                <SectionHeading
                  id="programs-heading"
                  eyebrow="招聘项目"
                  title="校园招聘与实习入口"
                  description="项目名称与链接来自企业公开页面；具体批次以官网为准。"
                />
                <ul className="space-y-3">
                  {company.hiring_programs.map((program) => (
                    <li key={program.name} className="rounded-xl border border-line bg-surface p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-semibold text-ink-900">{program.name}</h3>
                        {program.url ? (
                          <ExternalLink href={program.url} className="text-xs">
                            官方入口
                          </ExternalLink>
                        ) : null}
                      </div>
                      {program.description ? (
                        <p className="mt-1 text-xs leading-5 text-ink-500">{program.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section aria-labelledby="company-sources-heading">
              <SectionHeading
                id="company-sources-heading"
                eyebrow="来源与核验"
                title="每条信息的来源"
                description="企业招聘信息变化较快，投递前请重新核对官方 JD。"
              />
              <SourceList sources={company.sources} />
              {company.notes ? (
                <p className="mt-3 rounded-xl border border-line bg-surface p-4 text-xs leading-5 text-ink-500">
                  {company.notes}
                </p>
              ) : null}
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
              <h2 className="text-sm font-bold text-ink-900">企业信息</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <p className="text-xs text-ink-500">行业</p>
                  <p className="text-ink-900">{company.industry}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">官网</p>
                  <ExternalLink href={company.website} className="text-sm">
                    访问官网
                  </ExternalLink>
                </div>
                <div>
                  <p className="text-xs text-ink-500">校招入口</p>
                  <ExternalLink href={company.careers_url} className="text-sm">
                    校园招聘
                  </ExternalLink>
                </div>
                <div>
                  <p className="text-xs text-ink-500">最后核验</p>
                  <p className="text-ink-900">{company.last_verified_at ?? '待核验'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-brand-50 p-5">
              <h2 className="text-sm font-bold text-ink-900">有遗漏或变化？</h2>
              <p className="mt-2 text-xs leading-5 text-ink-700">
                招聘条款会随批次变化。请附官方 JD 链接、访问日期与截图/原文，不要只写“听说”。
              </p>
              <ExternalButton
                href={issueTemplateUrl('company-add.yml')}
                className="mt-3 w-full"
                size="sm"
              >
                补充企业信息
              </ExternalButton>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
