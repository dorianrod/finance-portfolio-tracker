import type { ReactNode } from 'react'

import type { DashboardLoadState as DashboardLoadStateModel } from '@/app/types/dashboardLoadState.type'
import i18n from '@/i18n/i18n'
import { StatusMessage } from '@/shared/ui/Controls.view'

export function DashboardLoadState({
  state,
  onRetry,
  children,
}: {
  state: DashboardLoadStateModel
  onRetry: () => void
  children: ReactNode
}) {
  switch (state.status) {
    case 'loading':
      return (
        <StatusMessage className="text-content-muted">
          {i18n.t('ui.app.loading')}
        </StatusMessage>
      )
    case 'error':
      return (
        <StatusMessage
          as="div"
          urgent
          className="rounded-card border border-danger/40 bg-surface p-6"
        >
          <p className="text-danger">
            {i18n.t('ui.app.errorWithValues', { message: state.message })}
          </p>
          <button
            type="button"
            className="mt-4 rounded-control border border-border-strong px-3 py-2 text-content"
            onClick={onRetry}
          >
            {i18n.t('ui.dashboardpanelerrorboundary.reloadDashboard')}
          </button>
        </StatusMessage>
      )
    case 'ready':
      return children
  }
  const exhaustiveState: never = state
  return exhaustiveState
}
