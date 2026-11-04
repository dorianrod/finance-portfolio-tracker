import { useFormatConcentrationDelta } from '@/domains/portfolio/features/diversification/features/concentration/helpers/formatters/useFormatConcentrationDelta'
import { useFormatPositionCount } from '@/domains/portfolio/features/diversification/features/concentration/helpers/formatters/useFormatPositionCount'
import i18n from '@/i18n/i18n'
import type { ChartTone } from '@/shared/theme/chartColors/chartColors.types'
import { ChartText } from '@/shared/ui/ChartText.view'
import { Text } from '@/shared/ui/Text.view'

export function ThresholdRow({
  label,
  tone,
  value,
  delta,
}: {
  label: string
  tone: ChartTone
  // The identified coverage may never reach this concentration threshold.
  value: number | null
  // A threshold change needs reachable targets in both compared snapshots.
  delta: number | null
}) {
  const formatConcentrationDelta = useFormatConcentrationDelta()
  const formatPositionCount = useFormatPositionCount()
  return (
    <div>
      <ChartText tone={tone}>{label}</ChartText> {formatPositionCount(value)}{' '}
      <Text tone="subtle">
        ·{' '}
        {value == null
          ? i18n.t(
              'ui.concentrationtrendsection.insufficientIdentifiedCoverage',
            )
          : formatConcentrationDelta(delta)}
      </Text>
    </div>
  )
}
