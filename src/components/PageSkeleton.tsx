import { Container } from './Layout';

export function PageSkeleton({ label = '正在加载…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div className="border-b border-line bg-surface">
        <Container className="py-8 sm:py-12">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton mt-4 h-10 w-2/3 max-w-xl rounded-lg" />
          <div className="skeleton mt-4 h-4 w-full max-w-2xl rounded" />
          <div className="skeleton mt-2 h-4 w-4/5 max-w-xl rounded" />
        </Container>
      </div>
      <Container className="py-8">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-line bg-surface p-5">
              <div className="skeleton h-5 w-16 rounded-full" />
              <div className="skeleton mt-4 h-5 w-3/4 rounded" />
              <div className="skeleton mt-4 h-4 w-full rounded" />
              <div className="skeleton mt-2 h-4 w-5/6 rounded" />
              <div className="skeleton mt-6 h-4 w-1/3 rounded" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
