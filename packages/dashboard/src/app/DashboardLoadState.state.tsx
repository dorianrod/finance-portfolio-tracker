import type { ReactNode } from 'react'

import i18n from '@/i18n/i18n'

export type DashboardLoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready' }

export function DashboardLoadState({
  state,
  onRetry,
  children,
}: {
  state: DashboardLoadState
  onRetry: () => void
  children: ReactNode
}) {
  switch (state.status) {
    case 'loading':
      return (
        <p role="status" className="text-content-muted">
          {i18n.t('ui.app.loading')}
        </p>
      )
    case 'error':
      return (
        <div
          role="alert"
          className="rounded-card border border-danger/40 bg-surface p-6"
        >
          <p className="text-danger">
            {i18n.t('ui.app.error')} {state.message}
          </p>
          <button
            type="button"
            className="mt-4 rounded-control border border-border-strong px-3 py-2 text-content"
            onClick={onRetry}
          >
            {i18n.t('ui.dashboardpanelerrorboundary.reloadDashboard')}
          </button>
        </div>
      )
    case 'ready':
      return children
  }
  const exhaustiveState: never = state
  return exhaustiveState
}
