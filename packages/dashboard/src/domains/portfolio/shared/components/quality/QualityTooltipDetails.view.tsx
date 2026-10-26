import i18n from '@/i18n/i18n'
import { Decorative } from '@/shared/ui/Controls.view'
import { ToneSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

import {
  type QualityTooltipRow,
  RELIABILITY_TONES,
} from './helpers/presenters/qualityReliabilityPresentation'

export function InfoIcon() {
  return (
    <Decorative
      variant="infoSymbol"
      className="flex h-4 w-4 items-center justify-center"
    >
      {i18n.t('ui.analysisreliabilitykpi.i')}
    </Decorative>
  )
}

export function QualityTooltipMetricRow({ row }: { row: QualityTooltipRow }) {
  const rowStyles = RELIABILITY_TONES[row.tone]
  return (
    <span className="flex items-center justify-between gap-4 py-1.5">
      <span className="flex min-w-0 items-center gap-2">
        <ToneSwatch
          tone={rowStyles.dot}
          shape="dot"
          className="h-1.5 w-1.5 shrink-0"
        />
        <Text variant="micro" tone="secondary">
          {row.label}
        </Text>
      </span>
      <Text align="right" className="shrink-0">
        <Text
          variant="captionStrong"
          tone={rowStyles.value}
          numeric
          className="block"
        >
          {row.value}
        </Text>
        {row.secondary && (
          <Text variant="tiny" tone="subtle" numeric className="mt-0.5 block">
            {row.secondary}
          </Text>
        )}
      </Text>
    </span>
  )
}
