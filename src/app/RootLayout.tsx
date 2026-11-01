import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { ScrollToTop } from '../components/ScrollToTop';

export function RootLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-700 focus:shadow-lg"
      >
        跳到主要内容
      </a>
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent">
        <div className="scroll-progress-bar h-full origin-left bg-gradient-to-r from-brand-500 via-brand-200 to-accent-500" />
      </div>
      <ScrollToTop />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <div key={location.pathname} className="page-in">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
      <Footer />
    </div>
  );
}
