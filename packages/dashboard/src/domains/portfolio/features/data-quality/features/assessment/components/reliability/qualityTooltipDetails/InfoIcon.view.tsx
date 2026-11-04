import i18n from '@/i18n/i18n'
import { Decorative } from '@/shared/ui/controls/Decorative.view'

export function InfoIcon() {
  return (
    <Decorative variant="infoSymbol">
      {i18n.t('ui.analysisreliabilitykpi.i')}
    </Decorative>
  )
}
