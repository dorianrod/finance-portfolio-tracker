import i18n from '@/i18n/i18n'
import { Surface } from '@/shared/ui/Surface.view'

export function DashboardPanelFallback() {
  return (
    <Surface
      variant="subduedCard"
      tone="subtle"
      align="center"
      className="mb-6 p-8"
    >
      {i18n.t('ui.app.loadingAnalysis')}
    </Surface>
  )
}
