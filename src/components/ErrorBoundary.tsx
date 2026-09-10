import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0f1c] text-blue-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full terminal-card space-y-4 text-center border border-red-500/30 p-6 rounded-xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-400 mb-2">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            <p className="text-sm text-gray-400">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            {this.state.error?.message?.includes('Supabase') && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-left text-xs text-yellow-200 mt-4 space-y-2">
                <p className="font-semibold text-yellow-300">💡 Missing Vercel Environment Variables?</p>
                <p>Ensure you have added <code className="bg-black/40 px-1 py-0.5 rounded text-yellow-400">VITE_SUPABASE_URL</code> and <code className="bg-black/40 px-1 py-0.5 rounded text-yellow-400">VITE_SUPABASE_ANON_KEY</code> in your Vercel Project Settings, then trigger a <strong>Redeploy</strong>.</p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
