import { Component, type ErrorInfo, type ReactNode } from 'react'

import i18n from '@/i18n/i18n'
import { Button, StatusMessage } from '@/shared/ui/Controls.view'
import { Text } from '@/shared/ui/Text.view'

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
        variant="errorPanel"
        align="center"
        className="mb-6 p-8"
      >
        <Text as="p" variant="label" tone="negative">
          {i18n.t('ui.dashboardpanelerrorboundary.unableToLoadThisAnalysis')}
        </Text>
        <Text as="p" variant="body" tone="subtle" className="mt-2">
          {i18n.t(
            'ui.dashboardpanelerrorboundary.reloadTheDashboardToTryDownloadingThePanelAgain',
          )}
        </Text>
        <Button
          type="button"
          variant="raised"
          className="mt-4 px-3 py-2"
          onClick={this.props.onRetry}
        >
          {i18n.t('ui.dashboardpanelerrorboundary.reloadDashboard')}
        </Button>
      </StatusMessage>
    )
  }
}
