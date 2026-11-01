import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : '未知错误',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('页面渲染失败', error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div role="alert" className="rounded-2xl border border-danger-700/25 bg-danger-100 p-6">
          <h1 className="text-xl font-bold text-danger-700">页面加载失败</h1>
          <p className="mt-2 text-sm leading-6 text-ink-700">
            数据或组件出现异常，页面没有加载完成。请刷新重试；如果问题持续存在，请通过 GitHub Issue
            反馈，并附上浏览器控制台错误信息。
          </p>
          <p className="mt-3 rounded-lg bg-surface/70 p-3 font-mono text-xs break-words text-ink-700">
            {this.state.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-danger-700 px-4 py-2 text-sm font-semibold text-white"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }
}
