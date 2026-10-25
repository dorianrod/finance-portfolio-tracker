import { Component, type ErrorInfo, type ReactNode } from 'react'

import i18n from '@/i18n/i18n'
import { StatusMessage } from '@/shared/ui/Controls.view'

type DashboardPanelErrorBoundaryProps = {
  children: ReactNode
  onRetry: () => void
}

type DashboardPanelErrorBoundaryState = {
  error: Error | null
}

export class DashboardPanelErrorBoundary extends Component<
  DashboardPanelErrorBoundaryProps,
  DashboardPanelErrorBoundaryState
> {
  state: DashboardPanelErrorBoundaryState = { error: null }

  static getDerivedStateFromError(
    error: Error,
  ): DashboardPanelErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Dashboard panel failed to render', error, errorInfo)
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children

    return (
      <StatusMessage
        as="div"
        urgent
        className="mb-6 rounded-card border border-danger/40 bg-surface p-8 text-center"
      >
        <p className="text-sm font-medium text-danger">
          {i18n.t('ui.dashboardpanelerrorboundary.unableToLoadThisAnalysis')}
        </p>
        <p className="mt-2 text-sm text-content-subtle">
          {i18n.t(
            'ui.dashboardpanelerrorboundary.reloadTheDashboardToTryDownloadingThePanelAgain',
          )}
        </p>
        <button
          type="button"
          className="mt-4 rounded-control border border-border-strong bg-surface-raised px-3 py-2 text-sm font-medium text-content hover:bg-surface"
          onClick={this.props.onRetry}
        >
          {i18n.t('ui.dashboardpanelerrorboundary.reloadDashboard')}
        </button>
      </StatusMessage>
    )
  }
}
