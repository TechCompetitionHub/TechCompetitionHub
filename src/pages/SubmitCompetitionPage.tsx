import { useState } from 'react';
import { Alert } from '../components/States';
import { Button, ExternalButton } from '../components/Button';
import { Field, Select, TextInput } from '../components/Fields';
import { Container, PageHeader, SectionHeading } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { ExternalLink } from '../components/ExternalLink';
import { getAudienceOptions, getDomainOptions } from '../services/competitionService';
import { issueTemplateUrl, SITE } from '../services/site';

interface DraftForm {
  name: string;
  slug: string;
  officialUrl: string;
  organizer: string;
  sourceTitle: string;
  sourceUrl: string;
  summary: string;
  description: string;
  audience: string;
  domains: string[];
}

const INITIAL_FORM: DraftForm = {
  name: '',
  slug: 'new-competition',
  officialUrl: '',
  organizer: '',
  sourceTitle: '官方来源',
  sourceUrl: '',
  summary: '',
  description: '',
  audience: 'undergraduate',
  domains: [],
};

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function SubmitCompetitionPage() {
  usePageMeta({
    title: '提交竞赛',
    description:
      '填写竞赛名称、官方来源、领域与说明，生成可复制的 JSON 草稿与 GitHub Issue 提交入口。草稿默认 needs_review，不写分数。',
  });

  const domains = getDomainOptions();
  const audiences = getAudienceOptions();
  const [form, setForm] = useState<DraftForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [draft, setDraft] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState('');

  const update = <K extends keyof DraftForm>(key: K, value: DraftForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleDomain = (id: string) => {
    setForm((current) => ({
      ...current,
      domains: current.domains.includes(id)
        ? current.domains.filter((domain) => domain !== id)
        : [...current.domains, id],
    }));
  };

  const generate = () => {
    const issues: string[] = [];
    if (form.name.trim().length < 2) issues.push('竞赛名称至少 2 个字符。');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
      issues.push('ID 必须是小写 kebab-case，例如 my-competition。');
    }
    if (!isHttpUrl(form.officialUrl)) issues.push('官方入口必须是 http(s) URL。');
    if (!isHttpUrl(form.sourceUrl || form.officialUrl)) {
      issues.push('来源 URL 必须是 http(s) URL。');
    }
    if (form.summary.trim().length < 20) issues.push('一句话说明至少 20 个字符。');
    if (form.description.trim().length < 50) issues.push('详细说明至少 50 个字符。');
    if (form.domains.length === 0) issues.push('至少选择一个领域。');

    setErrors(issues);
    if (issues.length > 0) {
      setDraft(null);
      return;
    }

    const slug = form.slug.trim();
    const officialUrl = form.officialUrl.trim();
    const sourceUrl = (form.sourceUrl || form.officialUrl).trim();
    const sourceTitle = form.sourceTitle.trim() || '官方来源';
    const publisher = form.organizer.trim() || '待核验';

    const record = {
      schema_version: '1.0.0',
      is_example: false,
      id: slug,
      name: form.name.trim(),
      aliases: [],
      organizers: form.organizer.trim()
        ? [{ name: form.organizer.trim(), role: 'organizer', url: null }]
        : [],
      domains: form.domains,
      summary: form.summary.trim(),
      description: form.description.trim(),
      audience: {
        levels: [form.audience],
        notes: '用户提交草稿；具体资格以当届通知为准。',
      },
      format: {
        team_based: true,
        team_size: null,
        delivery_modes: ['offline'],
        notes: '用户提交草稿；赛制待维护者核验。',
      },
      difficulty: {
        level: 1,
        rationale: '用户提交草稿；难度待维护者结合赛制评估。',
      },
      estimated_cost: {
        amount: null,
        currency: 'CNY',
        status: 'unknown',
        basis: null,
        notes: '用户提交草稿；费用待核验。',
      },
      skills_required: [],
      schedule: {
        registration_start: null,
        registration_end: null,
        event_start: null,
        event_end: null,
        status: 'unknown',
        notes: '用户提交草稿；日期待核验。',
      },
      official_urls: [{ label: '官方入口', url: officialUrl }],
      sources: [
        {
          id: `${slug}-official`,
          title: sourceTitle,
          url: sourceUrl,
          publisher,
          source_type: 'official',
          published_at: null,
          accessed_at: new Date().toISOString().slice(0, 10),
          supports: ['name', 'official_url'],
          confidence: 'medium',
          notes: '用户提交草稿；维护者需复核来源。',
        },
      ],
      external_lists: [],
      verification_status: 'needs_review',
      last_verified_at: null,
      created_at: new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString().slice(0, 10),
      scoring_model_version: null,
      scores: null,
      notes: '用户提交草稿：未评分、未核验。提交前请复核来源、领域、赛制与日期，不要填写虚构分数。',
    };

    setDraft(`${JSON.stringify(record, null, 2)}\n`);
    setCopyStatus('已生成草稿。复制或下载后，按贡献指南提交 PR。');
  };

  const copyDraft = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopyStatus('已复制 JSON 草稿。');
    } catch {
      setCopyStatus('复制失败，请使用下载按钮。');
    }
  };

  const downloadDraft = () => {
    if (!draft) return;
    const blob = new Blob([draft], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${form.slug || 'competition'}-draft.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setCopyStatus('已下载 JSON 草稿。');
  };

  return (
    <>
      <PageHeader
        eyebrow="参与贡献"
        title="提交一条竞赛"
        description="填写可核验的信息，生成 JSON 草稿。草稿默认 needs_review、不包含评分；维护者复核后才会进入公开目录。"
        actions={
          <ExternalButton href={issueTemplateUrl('competition-add.yml')}>
            打开 Issue 表单
          </ExternalButton>
        }
      />

      <Container className="py-8">
        <Alert tone="info" title="提交前请先核对官方来源">
          平台不接受虚构的报名时间、费用、获奖比例或官方排名。无法确认的字段请保持“待核验”，不要用 0
          或 100 表示未知评分。
        </Alert>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form
            className="rounded-2xl border border-line bg-surface p-5 shadow-card"
            onSubmit={(event) => {
              event.preventDefault();
              generate();
            }}
          >
            <SectionHeading eyebrow="第 1 步" title="填写事实与来源" />
            <div className="space-y-4">
              <Field label="竞赛名称" htmlFor="submit-name" hint="使用官方名称，不要用宣传语。">
                <TextInput
                  id="submit-name"
                  value={form.name}
                  onChange={(event) => update('name', event.target.value)}
                  placeholder="例如：全国大学生机器人大赛 ROBOCON"
                />
              </Field>
              <Field
                label="稳定 ID（草稿）"
                htmlFor="submit-slug"
                hint="小写 kebab-case；提交前请改成稳定英文 ID，避免与他人冲突。"
              >
                <TextInput
                  id="submit-slug"
                  value={form.slug}
                  onChange={(event) => update('slug', event.target.value)}
                  placeholder="robocon"
                />
              </Field>
              <Field label="官方入口" htmlFor="submit-official" hint="官网、章程或组委会通知。">
                <TextInput
                  id="submit-official"
                  type="url"
                  value={form.officialUrl}
                  onChange={(event) => update('officialUrl', event.target.value)}
                  placeholder="https://..."
                />
              </Field>
              <Field label="主办/组织方（可选）" htmlFor="submit-organizer">
                <TextInput
                  id="submit-organizer"
                  value={form.organizer}
                  onChange={(event) => update('organizer', event.target.value)}
                  placeholder="例如：中国机械工程学会"
                />
              </Field>
              <Field
                label="来源标题"
                htmlFor="submit-source-title"
                hint="例如：竞赛官网首页 / 2026 年通知。"
              >
                <TextInput
                  id="submit-source-title"
                  value={form.sourceTitle}
                  onChange={(event) => update('sourceTitle', event.target.value)}
                />
              </Field>
              <Field
                label="来源 URL"
                htmlFor="submit-source-url"
                hint="留空时使用官方入口；请确认链接可访问。"
              >
                <TextInput
                  id="submit-source-url"
                  type="url"
                  value={form.sourceUrl}
                  onChange={(event) => update('sourceUrl', event.target.value)}
                  placeholder="https://..."
                />
              </Field>
              <Field label="适合对象" htmlFor="submit-audience">
                <Select
                  id="submit-audience"
                  value={form.audience}
                  onChange={(event) => update('audience', event.target.value)}
                >
                  {audiences.map((audience) => (
                    <option key={audience.id} value={audience.id}>
                      {audience.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-ink-900">
                  领域（至少 1 个）
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {domains.map((domain) => (
                    <label
                      key={domain.id}
                      className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-ink-700"
                    >
                      <input
                        type="checkbox"
                        checked={form.domains.includes(domain.id)}
                        onChange={() => toggleDomain(domain.id)}
                        className="size-4 accent-brand-600"
                      />
                      {domain.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field
                label="一句话说明"
                htmlFor="submit-summary"
                hint="至少 20 字，客观描述竞赛考查什么。"
              >
                <TextInput
                  id="submit-summary"
                  value={form.summary}
                  onChange={(event) => update('summary', event.target.value)}
                  placeholder="团队自主研发机器人完成现场任务。"
                />
              </Field>
              <Field
                label="详细说明"
                htmlFor="submit-description"
                hint="至少 50 字；写清来源支持的事实与仍未知的字段。"
              >
                <textarea
                  id="submit-description"
                  value={form.description}
                  onChange={(event) => update('description', event.target.value)}
                  rows={5}
                  className="field-control"
                />
              </Field>
            </div>

            {errors.length > 0 ? (
              <Alert tone="danger" title="请修正以下问题" className="mt-4">
                <ul className="list-disc space-y-1 pl-5">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </Alert>
            ) : null}

            <Button type="submit" className="mt-5 w-full">
              生成 JSON 草稿
            </Button>
            <p className="mt-2 text-xs leading-5 text-ink-500">
              站点不保存表单内容；生成与复制均在浏览器本地完成。正式提交请走 GitHub Issue/PR。
            </p>
          </form>

          <section aria-labelledby="draft-heading">
            <SectionHeading
              id="draft-heading"
              eyebrow="第 2 步"
              title="预览与提交"
              description="草稿状态为 needs_review，scores 为 null；不要把它直接当作已验证数据。"
            />
            {draft ? (
              <div className="space-y-3">
                <pre className="max-h-[32rem] overflow-auto rounded-xl bg-navy-900 p-4 text-xs leading-5 text-white">
                  <code>{draft}</code>
                </pre>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={copyDraft}>
                    复制 JSON
                  </Button>
                  <Button variant="secondary" onClick={downloadDraft}>
                    下载 JSON
                  </Button>
                  <ExternalButton href={issueTemplateUrl('competition-add.yml')}>
                    Issue 表单
                  </ExternalButton>
                </div>
                <p role="status" className="text-xs text-brand-700">
                  {copyStatus}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-line-strong bg-surface/70 p-8 text-sm leading-6 text-ink-500">
                填写左侧表单并生成草稿后，这里会显示可复制的 JSON。提交前请阅读{' '}
                <ExternalLink href={`${SITE.repo}/blob/main/CONTRIBUTING.md`} className="text-sm">
                  贡献指南
                </ExternalLink>
                ，并运行数据校验。
              </div>
            )}
          </section>
        </div>
      </Container>
    </>
  );
}
