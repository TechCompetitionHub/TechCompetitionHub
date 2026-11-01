import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert } from '../components/States';
import { Button, ExternalButton } from '../components/Button';
import { Field, Select, TextInput } from '../components/Fields';
import { Container, PageHeader, SectionHeading } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { listCompetitions } from '../services/competitionService';
import { issueTemplateUrl, SITE } from '../services/site';

const ROLES = [
  { value: 'participant', label: '参赛队员' },
  { value: 'team_lead', label: '队长/负责人' },
  { value: 'advisor', label: '指导教师' },
  { value: 'organizer', label: '组织者' },
  { value: 'observer', label: '关注者/未参赛' },
] as const;

const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  ROLES.map((role) => [role.value, role.label]),
);

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function SubmitReviewPage() {
  usePageMeta({
    title: '提交参赛评价',
    description:
      '提交带公开背景信息的参赛评价：是否参加过、赛道、年份、学校、角色与公开主页。审核后展示，不参与平台评分与排名。',
  });

  const competitions = listCompetitions();
  const [searchParams] = useSearchParams();
  const initialCompetition = searchParams.get('competition') ?? competitions[0]?.id ?? '';
  const [competitionId, setCompetitionId] = useState(initialCompetition);
  const [rating, setRating] = useState('4');
  const [participated, setParticipated] = useState('yes');
  const [track, setTrack] = useState('');
  const [year, setYear] = useState('');
  const [school, setSchool] = useState('');
  const [role, setRole] = useState('participant');
  const [publicProfile, setPublicProfile] = useState('');
  const [review, setReview] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const selected = competitions.find((competition) => competition.id === competitionId);
  const participatedBool = participated === 'yes';

  const generate = () => {
    const issues: string[] = [];
    if (!selected) issues.push('请选择竞赛。');
    const ratingNumber = Number(rating);
    if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      issues.push('评分必须是 1–5 的整数。');
    }
    if (participatedBool && track.trim().length === 0) issues.push('参加过时请填写赛道/组别。');
    if (participatedBool && !/^\d{4}$/.test(year.trim())) {
      issues.push('参加过时请填写四位数的参赛年份。');
    }
    if (review.trim().length < 20) issues.push('评价至少 20 个字符。');
    if (evidenceUrl.trim() && !isHttpUrl(evidenceUrl)) issues.push('证据链接必须是 http(s) URL。');
    if (!consent) issues.push('必须确认同意公开展示这些信息。');

    setErrors(issues);
    if (issues.length > 0) {
      setMarkdown(null);
      return;
    }

    const body = [
      '## 社区参赛评价',
      '',
      `- 竞赛：${selected?.name ?? competitionId}（${competitionId}）`,
      `- 评分：${ratingNumber} / 5`,
      `- 是否参加过：${participatedBool ? '是' : '否'}`,
      `- 赛道/组别：${track.trim() || '未填写'}`,
      `- 参赛年份：${year.trim() || '未填写'}`,
      `- 学校（公开）：${school.trim() || '未公开'}`,
      `- 角色：${ROLE_LABELS[role] ?? role}`,
      `- 公开主页：${publicProfile.trim() || '未提供'}`,
      `- 证据链接：${evidenceUrl.trim() || '未提供'}`,
      `- 同意公开展示：是`,
      '',
      '### 评价',
      '',
      review.trim(),
      '',
      '---',
      '> 本评价为用户自述，未经平台验证参赛经历；不参与平台六维评分或正式排名。',
    ].join('\n');

    setMarkdown(body);
    setStatus('已生成评价草稿。请在 GitHub Issue 中提交，审核后才会公开展示。');
  };

  const copyMarkdown = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setStatus('已复制评价 Markdown。');
    } catch {
      setStatus('复制失败，请手动选择文本复制。');
    }
  };

  const issueUrl =
    markdown && selected
      ? `${issueTemplateUrl('community-review.md')}&title=${encodeURIComponent(
          `[评价] ${selected.name}`,
        )}&body=${encodeURIComponent(markdown)}`
      : issueTemplateUrl('community-review.md');

  return (
    <>
      <PageHeader
        eyebrow="社区评价"
        title="提交参赛评价"
        description="说明是否参加过、赛道、年份、学校、角色与公开主页。评价经审核后才展示；它不参与平台评分或正式排名。"
        actions={<ExternalButton href={SITE.discussions}>前往 Discussions</ExternalButton>}
      />

      <Container className="py-8">
        <Alert tone="warning" title="公开展示与隐私">
          赛道、年份、学校、角色与公开主页会随评价公开显示。学校可以留空；请勿填写手机号、身份证、真实姓名或其他敏感信息。评价是用户自述，平台不会自动验证参赛经历。
        </Alert>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <form
            className="rounded-2xl border border-line bg-surface p-5 shadow-card"
            onSubmit={(event) => {
              event.preventDefault();
              generate();
            }}
          >
            <SectionHeading eyebrow="第 1 步" title="选择竞赛与背景" />
            <div className="space-y-4">
              <Field label="竞赛" htmlFor="review-competition">
                <Select
                  id="review-competition"
                  value={competitionId}
                  onChange={(event) => setCompetitionId(event.target.value)}
                >
                  {competitions.map((competition) => (
                    <option key={competition.id} value={competition.id}>
                      {competition.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="综合评分"
                htmlFor="review-rating"
                hint="1 星最低，5 星最高；不是官方评分。"
              >
                <Select
                  id="review-rating"
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                >
                  <option value="5">5 星 · 非常推荐</option>
                  <option value="4">4 星 · 推荐</option>
                  <option value="3">3 星 · 一般</option>
                  <option value="2">2 星 · 不太推荐</option>
                  <option value="1">1 星 · 不推荐</option>
                </Select>
              </Field>

              <Field label="是否参加过" htmlFor="review-participated">
                <Select
                  id="review-participated"
                  value={participated}
                  onChange={(event) => setParticipated(event.target.value)}
                >
                  <option value="yes">参加过</option>
                  <option value="no">未参加，仅关注/了解</option>
                </Select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={participatedBool ? '赛道/组别' : '赛道/组别（可选）'}
                  htmlFor="review-track"
                  hint="例如：应用赛道、本科组、RoboCup 赛区。"
                >
                  <TextInput
                    id="review-track"
                    value={track}
                    onChange={(event) => setTrack(event.target.value)}
                    placeholder="本科组 / 应用赛道"
                  />
                </Field>
                <Field
                  label={participatedBool ? '参赛年份' : '参赛年份（可选）'}
                  htmlFor="review-year"
                  hint="四位数，例如 2025。"
                >
                  <TextInput
                    id="review-year"
                    inputMode="numeric"
                    value={year}
                    onChange={(event) => setYear(event.target.value)}
                    placeholder="2025"
                  />
                </Field>
              </div>

              <Field
                label="学校（可选，公开展示）"
                htmlFor="review-school"
                hint="可以留空；建议只填写学校名称，不填写院系、班级或个人信息。"
              >
                <TextInput
                  id="review-school"
                  value={school}
                  onChange={(event) => setSchool(event.target.value)}
                  placeholder="例如：某某大学"
                />
              </Field>

              <Field label="你的角色" htmlFor="review-role">
                <Select
                  id="review-role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                >
                  {ROLES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="公开主页（可选）"
                htmlFor="review-profile"
                hint="GitHub 用户名或公开主页；也可以留空。"
              >
                <TextInput
                  id="review-profile"
                  value={publicProfile}
                  onChange={(event) => setPublicProfile(event.target.value)}
                  placeholder="github-handle 或 https://..."
                />
              </Field>

              <Field
                label="评价"
                htmlFor="review-body"
                hint="至少 20 字；请写清赛制体验、准备过程、适合人群与限制。"
              >
                <textarea
                  id="review-body"
                  value={review}
                  onChange={(event) => setReview(event.target.value)}
                  rows={6}
                  className="field-control"
                  placeholder="我参加了哪个赛道、备赛多久、现场体验如何、对后来者有什么建议……"
                />
              </Field>

              <Field
                label="公开证据链接（可选）"
                htmlFor="review-evidence"
                hint="例如获奖公示、项目仓库或复盘文章；不要链接未授权材料。"
              >
                <TextInput
                  id="review-evidence"
                  type="url"
                  value={evidenceUrl}
                  onChange={(event) => setEvidenceUrl(event.target.value)}
                  placeholder="https://..."
                />
              </Field>

              <label className="flex items-start gap-2 rounded-lg border border-line p-3 text-sm leading-6 text-ink-700">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-1 size-4 accent-brand-600"
                />
                <span>
                  我同意公开展示上述信息（含赛道、年份、学校、角色与公开主页），并确认内容不包含手机号、身份证、真实姓名或其他敏感信息。
                </span>
              </label>
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
              生成评价草稿
            </Button>
            <p className="mt-2 text-xs leading-5 text-ink-500">
              站点不保存表单内容；提交通过 GitHub Issue，审核后由维护者加入{' '}
              <code>data/reviews/</code>。
            </p>
          </form>

          <section aria-labelledby="review-preview-heading">
            <SectionHeading
              id="review-preview-heading"
              eyebrow="第 2 步"
              title="预览与提交"
              description="检查公开信息是否准确；提交后需要审核，不会立即出现在竞赛页面。"
            />
            {markdown ? (
              <div className="space-y-3">
                <pre className="max-h-[32rem] overflow-auto rounded-xl bg-navy-900 p-4 text-xs leading-5 text-white">
                  <code>{markdown}</code>
                </pre>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={copyMarkdown}>
                    复制 Markdown
                  </Button>
                  <ExternalButton href={issueUrl}>在 GitHub 提交</ExternalButton>
                  <Link
                    to={`/competitions/${competitionId}`}
                    className="link-inline self-center text-sm"
                  >
                    返回竞赛详情
                  </Link>
                </div>
                <p role="status" className="text-xs text-brand-700">
                  {status}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-line-strong bg-surface/70 p-8 text-sm leading-6 text-ink-500">
                填写左侧信息并生成评价后，这里会显示 Markdown 与 GitHub 提交入口。提交前请阅读{' '}
                <Link to="/privacy" className="link-inline">
                  隐私说明
                </Link>
                ；学校与年份会公开显示。
              </div>
            )}
          </section>
        </div>
      </Container>
    </>
  );
}
