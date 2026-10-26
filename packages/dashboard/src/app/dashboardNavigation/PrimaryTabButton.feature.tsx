import { preloadDashboardTab } from '@/app/routing/dashboardTabLoaders/preloadDashboardTab'
import { NavigationButton } from '@/shared/ui/controls/NavigationButton.view'
import { Layout } from '@/shared/ui/layout/Layout.view'

import type { PrimaryTabButtonProps } from './dashboardNavigation.types'

export function PrimaryTabButton({
  activeTab,
  onNavigate,
  tab,
}: PrimaryTabButtonProps) {
  return (
    <Layout as="span" flow="control" sizing="fixed">
      <NavigationButton
        type="button"
        onClick={() => onNavigate(tab.id)}
        onIntent={() => preloadDashboardTab(tab.id)}
        active={activeTab === tab.id}
        variant="tab"
      >
        {tab.label}
      </NavigationButton>
    </Layout>
  )
}
