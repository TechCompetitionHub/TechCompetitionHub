import { ButtonLink } from '../components/Button';
import { Container, PageHeader } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { ExternalLink } from '../components/ExternalLink';
import { SITE } from '../services/site';

export function PrivacyPage() {
  usePageMeta({
    title: '隐私说明',
    description:
      '本站首版不要求注册，不收集学生证号、身份证、手机号或真实姓名，不使用跟踪脚本；技能自评仅在浏览器内使用。',
  });

  return (
    <>
      <PageHeader
        eyebrow="透明与治理"
        title="隐私说明"
        description="首版是静态站点，没有账户、数据库或后端 API。我们尽量少收集信息，并明确说明哪些数据只留在你的浏览器里。"
        actions={
          <ButtonLink to="/data-policy" variant="secondary">
            数据政策
          </ButtonLink>
        }
      />

      <Container className="py-8">
        <div className="prose-content max-w-3xl">
          <h2>我们不收集什么</h2>
          <ul>
            <li>不要求注册账户，不收集密码；</li>
            <li>不收集学生证号、身份证号、手机号、住址或真实姓名；</li>
            <li>不使用广告、第三方分析或跨站跟踪脚本；</li>
            <li>不把技能自评上传到任何服务；</li>
            <li>不保存聊天记录或私信，因为首版没有这些功能。</li>
          </ul>

          <h2>技能自评与成长计划</h2>
          <p>
            你在成长规划器中选择的等级、每周时间与计划只存在于当前页面的内存中。刷新页面后会重置，不会写入服务器，也不会进入公开仓库。导出
            Markdown 由你的浏览器本地生成；复制或下载后，文件由你自行保管。
          </p>

          <h2>托管与访问日志</h2>
          <p>
            本站部署在 GitHub Pages。GitHub 可能按其隐私政策记录访问日志（例如
            IP、User-Agent、请求路径）。这些日志由 GitHub
            处理，平台维护者不额外增加跟踪脚本，也无法导出或出售访问者画像。
          </p>

          <h2>外部链接</h2>
          <p>
            本站链接到竞赛官网、GitHub、学习资源等外部站点。点击后你离开本站，目标站点的隐私政策与
            Cookie 行为由该站点负责。外链使用新标签页打开，并带有{' '}
            <code>rel=&quot;noopener noreferrer&quot;</code>。
          </p>

          <h2>项目与社区内容</h2>
          <p>
            项目成员姓名、角色与贡献必须由提交者确认拥有发布权限。我们建议只公开 GitHub handle
            或公开贡献记录，不要求真实姓名。涉及个人敏感信息的帖子会被移除。GitHub
            Discussions、Issue 与 PR 的内容由 GitHub 托管，适用 GitHub 的隐私政策。
          </p>

          <h2>安全</h2>
          <p>
            首版不存储秘密凭据，不在前端环境变量中放置令牌。发现安全问题时，请按 SECURITY.md
            中的私密渠道报告，不要在公开 Issue 中披露可利用细节或个人数据。
          </p>

          <h2>未来变化</h2>
          <p>
            如果未来引入账户、跨设备档案、动态评分或 AI
            辅助，我们会先说明收集目的、数据最小化、保留期限、删除方式与访问控制，并在启用前更新本页。首版不会提前实现这些功能。
          </p>

          <h2>联系</h2>
          <p>隐私相关问题可通过仓库 Issue 提出；涉及敏感信息时请使用 SECURITY.md 中的私密渠道。</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <ExternalLink href={`${SITE.repo}/blob/main/PRIVACY.md`} className="text-sm">
            查看仓库中的 PRIVACY.md
          </ExternalLink>
          <ExternalLink href={`${SITE.repo}/blob/main/SECURITY.md`} className="text-sm">
            安全政策
          </ExternalLink>
        </div>
      </Container>
    </>
  );
}
