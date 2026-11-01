import { Link } from 'react-router-dom';
import { Container } from '../components/Layout';
import { usePageMeta } from '../components/Seo';
import { ButtonLink } from '../components/Button';

export function NotFoundPage() {
  usePageMeta({
    title: '页面不存在',
    description: '你访问的页面不存在，可能已移动或链接有误。',
    noindex: true,
  });

  return (
    <Container className="py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-brand-700 uppercase">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          这个页面不存在
        </h1>
        <p className="mt-3 text-base leading-7 text-ink-500">
          链接可能已失效、竞赛 ID 拼写有误，或数据已被合并/重命名。下面的入口可以继续浏览。
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink to="/">返回首页</ButtonLink>
          <ButtonLink to="/competitions" variant="secondary">
            浏览竞赛目录
          </ButtonLink>
          <ButtonLink to="/skills" variant="secondary">
            技能图谱
          </ButtonLink>
        </div>
        <p className="mt-8 text-sm text-ink-500">
          如果你是从站内链接跳转而来，请通过{' '}
          <Link to="/contribute" className="link-inline">
            贡献指南
          </Link>{' '}
          报告失效链接。
        </p>
      </div>
    </Container>
  );
}
