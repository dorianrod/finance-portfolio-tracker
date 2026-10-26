import { formatPositionCount } from '@/domains/portfolio/features/diversification/features/concentration/helpers/formatters/formatPositionCount'
import { useFormatConcentrationDelta } from '@/domains/portfolio/features/diversification/features/concentration/helpers/formatters/useFormatConcentrationDelta'
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
  value: number | null
  delta: number | null
}) {
  const formatConcentrationDelta = useFormatConcentrationDelta()
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
