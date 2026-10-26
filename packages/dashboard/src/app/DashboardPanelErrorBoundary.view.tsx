import { Component, type ErrorInfo, type ReactNode } from 'react'

import i18n from '@/i18n/i18n'
import { Button, StatusMessage } from '@/shared/ui/Controls.view'
import { Inset, Layout } from '@/shared/ui/Layout.view'
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
      <div className="mb-6">
        <StatusMessage as="div" urgent variant="errorPanel" align="center">
          <Inset inset="spacious">
            <Text as="p" variant="label" tone="negative">
              {i18n.t(
                'ui.dashboardpanelerrorboundary.unableToLoadThisAnalysis',
              )}
            </Text>
            <Layout spaceBefore="default">
              <Text as="p" variant="body" tone="subtle">
                {i18n.t(
                  'ui.dashboardpanelerrorboundary.reloadTheDashboardToTryDownloadingThePanelAgain',
                )}
              </Text>
            </Layout>
            <Layout as="span" flow="control" spaceBefore="spacious">
              <Button
                type="button"
                variant="raised"
                onClick={this.props.onRetry}
              >
                {i18n.t('ui.dashboardpanelerrorboundary.reloadDashboard')}
              </Button>
            </Layout>
          </Inset>
        </StatusMessage>
      </div>
    )
  }
}
