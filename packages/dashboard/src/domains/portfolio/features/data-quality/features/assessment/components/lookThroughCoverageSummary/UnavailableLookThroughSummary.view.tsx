import i18n from '@/i18n/i18n'
import { Surface } from '@/shared/ui/Surface.view'

export function UnavailableLookThroughSummary() {
  return (
    <Surface variant="contentCard" tone="subtle">
      {i18n.t(
        'ui.lookthroughcoveragesummary.noLookThroughQualityReportRunThePortfolioPipeline',
      )}
    </Surface>
  )
}
