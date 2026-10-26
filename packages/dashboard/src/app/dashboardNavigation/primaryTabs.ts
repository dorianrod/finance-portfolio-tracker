import type { AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardNavigation.types'
import i18n from '@/i18n/i18n'

export const PRIMARY_TABS: Array<{
  id: Exclude<AnalysisTab, 'quality'>
  label: string
}> = [
  { id: 'overview', label: i18n.t('ui.app.overview') },
  { id: 'wealth', label: i18n.t('ui.app.wealthCashFlow') },
  { id: 'performance', label: i18n.t('ui.app.performancePassiveIncome') },
  { id: 'diversification', label: i18n.t('ui.app.diversification') },
  { id: 'holdings', label: i18n.t('ui.app.holdings') },
]
