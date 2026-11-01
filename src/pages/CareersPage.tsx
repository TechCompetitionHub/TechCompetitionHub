import { useSearchParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { ButtonLink, ExternalButton } from '../components/Button';
import { Field, Select } from '../components/Fields';
import { Container, PageHeader, SectionHeading } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { ExternalLink } from '../components/ExternalLink';
import { EmptyState } from '../components/States';
import {
  PREFERENCE_STATUS_DESCRIPTIONS,
  PREFERENCE_STATUS_LABELS,
  type PreferenceStatus,
} from '../lib/domain/careers';
import {
  getCompaniesByRole,
  getCompetitionName,
  getDirectChannelCompanies,
  getJobRoleLabel,
  getJobRoleOptions,
  listCompanies,
} from '../services/careerService';
import { issueTemplateUrl } from '../services/site';

const PREFERENCE_TONE: Record<PreferenceStatus, 'success' | 'info' | 'warning' | 'neutral'> = {
  direct_channel: 'success',
  priority: 'info',
  plus: 'warning',
  no_public_channel: 'neutral',
  unknown: 'neutral',
};

export function CareersPage() {
  usePageMeta({
    title: '求职方向与企业',
    description:
      '按嵌入式、前端、后端、算法、机器人、芯片等岗位方向浏览企业，查看竞赛直通、优先或加分条款与官方校招入口。',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const role = searchParams.get('role') ?? '';
  const roles = getJobRoleOptions();
  const companies = getCompaniesByRole(role);
  const directCompanies = getDirectChannelCompanies();
  const allCompanies = listCompanies();
  const roleLabel = role ? getJobRoleLabel(role) : '';

  return (
    <>
      <PageHeader
        eyebrow="求职地图"
        title="从竞赛经历走向岗位"
        description="按岗位方向或企业查看公开校招入口、常见工程师方向，以及竞赛是否被官方写成直通、优先或加分条款。没有公开依据的一律标为待核验。"
        meta={
          <p className="text-sm text-ink-500">
            <strong className="text-ink-900">{allCompanies.length}</strong> 家企业 ·{' '}
            <strong className="text-ink-900">{roles.length}</strong> 个岗位方向 ·{' '}
            <strong className="text-ink-900">{directCompanies.length}</strong> 家有公开直通/优先条款
          </p>
        }
        actions={
          <>
            <ExternalButton href={issueTemplateUrl('company-add.yml')}>补充企业信息</ExternalButton>
            <ButtonLink to="/competitions" variant="secondary">
              浏览竞赛
            </ButtonLink>
          </>
        }
      />

      <Container className="py-8">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:flex-row sm:items-end sm:justify-between">
          <Field label="按岗位方向筛选" htmlFor="career-role" className="sm:max-w-xs">
            <Select
              id="career-role"
              value={role}
              onChange={(event) => {
                const value = event.target.value;
                setSearchParams(value ? { role: value } : {}, { replace: true });
              }}
            >
              <option value="">全部岗位方向</option>
              {roles.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}（{item.count}）
                </option>
              ))}
            </Select>
          </Field>
          <p className="max-w-lg text-xs leading-5 text-ink-500">
            岗位方向来自企业公开校招页面与常见工程岗位分类，不等于具体岗位缺口；投递前请查看官网
            JD。
          </p>
        </div>

        <section aria-labelledby="roles-heading">
          <SectionHeading
            id="roles-heading"
            eyebrow="按岗位方向"
            title="先确定你想投什么岗位"
            description="选择方向后，下方企业列表会同步筛选。"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((item) => {
              const active = item.id === role;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setSearchParams(active ? {} : { role: item.id }, { replace: true })
                  }
                  className={`card-hover rounded-xl border p-4 text-left shadow-card ${
                    active ? 'border-brand-500 bg-brand-50' : 'border-line bg-surface'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink-900">{item.label}</span>
                    <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-ink-500">
                      {item.count}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-500">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="companies-heading">
          <SectionHeading
            id="companies-heading"
            eyebrow="按企业"
            title={roleLabel ? `${roleLabel}方向的企业` : '全部企业'}
            description="企业卡片只展示公开入口与已核验条款；点击进入详情查看逐条竞赛偏好与来源。"
            action={
              role ? (
                <button
                  type="button"
                  onClick={() => setSearchParams({}, { replace: true })}
                  className="text-sm font-semibold text-brand-700 hover:underline"
                >
                  清除岗位筛选
                </button>
              ) : null
            }
          />
          {companies.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {companies.map((company) => {
                const highlighted = company.competition_preferences.filter(
                  (preference) =>
                    preference.status === 'direct_channel' ||
                    preference.status === 'priority' ||
                    preference.status === 'plus',
                );
                return (
                  <article
                    key={company.id}
                    className="card-hover flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-card"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-ink-900">
                          <ButtonLink
                            to={`/careers/${company.id}`}
                            variant="ghost"
                            className="h-auto p-0 text-lg font-bold text-ink-900 hover:bg-transparent hover:text-brand-700"
                          >
                            {company.name}
                          </ButtonLink>
                        </h3>
                        <p className="mt-1 text-xs text-ink-500">{company.industry}</p>
                      </div>
                      <ExternalLink href={company.careers_url} className="text-xs">
                        校招官网
                      </ExternalLink>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {company.role_ids.slice(0, 5).map((roleId) => (
                        <Badge key={roleId} tone="brand">
                          {getJobRoleLabel(roleId)}
                        </Badge>
                      ))}
                      {company.role_ids.length > 5 ? (
                        <Badge tone="neutral">+{company.role_ids.length - 5}</Badge>
                      ) : null}
                    </div>

                    {highlighted.length > 0 ? (
                      <ul className="mt-4 space-y-2">
                        {highlighted.map((preference) => (
                          <li
                            key={`${preference.competition_id}-${preference.status}`}
                            className="rounded-lg bg-surface-muted px-3 py-2 text-xs leading-5 text-ink-700"
                          >
                            <Badge tone={PREFERENCE_TONE[preference.status]}>
                              {PREFERENCE_STATUS_LABELS[preference.status]}
                            </Badge>
                            <span className="ml-1 font-semibold">
                              {getCompetitionName(preference.competition_id)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-xs leading-5 text-ink-500">
                        暂无公开的竞赛直通/优先条款；详情页记录已核验的校招入口。
                      </p>
                    )}

                    <div className="mt-auto pt-4">
                      <ButtonLink to={`/careers/${company.id}`} variant="secondary" size="sm">
                        查看企业与竞赛偏好
                      </ButtonLink>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="这个岗位方向暂无企业"
              description="可以补充企业信息或切换到其它岗位方向。"
              action={
                <ExternalButton href={issueTemplateUrl('company-add.yml')}>补充企业</ExternalButton>
              }
            />
          )}
        </section>

        <section className="mt-10" aria-labelledby="channels-heading">
          <SectionHeading
            id="channels-heading"
            eyebrow="竞赛直通与偏好"
            title="只写官方公开的权益"
            description="“直通面试”只用于官方页面明确写出的权益；“优先/加分/可参与”与“未公开”分开标注。"
          />
          {directCompanies.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {directCompanies.map((company) => (
                <div
                  key={company.id}
                  className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-ink-900">{company.name}</h3>
                    <Badge tone="success">有公开条款</Badge>
                  </div>
                  <ul className="mt-3 space-y-3">
                    {company.competition_preferences
                      .filter((preference) => preference.status !== 'unknown')
                      .map((preference) => (
                        <li key={`${company.id}-${preference.competition_id}`} className="text-sm">
                          <p className="font-semibold text-ink-900">
                            {getCompetitionName(preference.competition_id)} ·{' '}
                            {PREFERENCE_STATUS_LABELS[preference.status]}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-ink-700">
                            {preference.statement}
                          </p>
                          <ExternalLink href={preference.source_url} className="mt-1 text-xs">
                            官方来源
                          </ExternalLink>
                        </li>
                      ))}
                  </ul>
                  <p className="mt-3 text-xs leading-5 text-ink-500">
                    {PREFERENCE_STATUS_DESCRIPTIONS.direct_channel}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-line bg-surface p-4 text-sm text-ink-500">
              暂无企业公开直通/优先条款。
            </p>
          )}
        </section>
      </Container>
    </>
  );
}
