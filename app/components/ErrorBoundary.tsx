'use client'

import { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error) {
    // Captura no PostHog quando disponível
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).posthog) {
      const ph = (window as unknown as Record<string, unknown>).posthog as { capture: (e: string, p: Record<string, unknown>) => void }
      ph.capture('js_error', { message: error.message, stack: error.stack })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--color-bg)' }}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-[var(--shadow-card)] text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Algo deu errado</h2>
            <p className="text-sm text-slate-500 mb-6">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-white"
              style={{ background: '#1a73e8' }}
            >
              Recarregar página
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
