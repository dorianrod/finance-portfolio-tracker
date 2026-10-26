import i18n from '@/i18n/i18n'
import { Surface } from '@/shared/ui/Surface.view'

export function DashboardPanelFallback() {
  return (
    <div className="mb-6">
      <Surface variant="subduedCard" tone="subtle" align="center">
        {i18n.t('ui.app.loadingAnalysis')}
      </Surface>
    </div>
  )
}
