import type { ReactNode } from 'react'

import type { DashboardLoadState as DashboardLoadStateModel } from '@/app/types/dashboardLoadState.type'
import i18n from '@/i18n/i18n'
import { Button, StatusMessage } from '@/shared/ui/Controls.view'
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
      return (
        <StatusMessage tone="muted">{i18n.t('ui.app.loading')}</StatusMessage>
      )
    case 'error':
      return (
        <StatusMessage as="div" urgent variant="errorPanel" className="p-6">
          <Text as="p" tone="negative">
            {i18n.t('ui.app.errorWithValues', { message: state.message })}
          </Text>
          <Button
            type="button"
            variant="outlined"
            className="mt-4 px-3 py-2"
            onClick={onRetry}
          >
            {i18n.t('ui.dashboardpanelerrorboundary.reloadDashboard')}
          </Button>
        </StatusMessage>
      )
    case 'ready':
      return children
  }
  const exhaustiveState: never = state
  return exhaustiveState
}
