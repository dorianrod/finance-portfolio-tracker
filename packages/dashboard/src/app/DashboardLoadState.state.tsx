import type { ReactNode } from 'react'

import { DashboardPanelFallback } from '@/app/DashboardPanelFallback.feature'
import type { DashboardLoadState as DashboardLoadStateModel } from '@/app/types/dashboardLoadState.type'
import i18n from '@/i18n/i18n'
import { Button } from '@/shared/ui/controls/Button.view'
import { StatusMessage } from '@/shared/ui/controls/StatusMessage.view'
import { Inset } from '@/shared/ui/layout/Inset.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Text } from '@/shared/ui/Text.view'

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
      return <DashboardPanelFallback />
    case 'error':
      return (
        <StatusMessage as="div" urgent variant="errorPanel">
          <Inset inset="spacious">
            <Text as="p" tone="negative">
              {i18n.t('ui.app.errorWithValues', { message: state.message })}
            </Text>
            <Layout as="span" flow="control" spaceBefore="spacious">
              <Button type="button" variant="outlined" onClick={onRetry}>
                {i18n.t('ui.dashboardpanelerrorboundary.reloadDashboard')}
              </Button>
            </Layout>
          </Inset>
        </StatusMessage>
      )
    case 'ready':
      return children
  }
  const exhaustiveState: never = state
  return exhaustiveState
}
