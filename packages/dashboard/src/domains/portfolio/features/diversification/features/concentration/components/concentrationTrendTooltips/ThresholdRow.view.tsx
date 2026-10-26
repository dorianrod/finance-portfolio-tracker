import { formatConcentrationDelta } from '@/domains/portfolio/features/diversification/features/concentration/helpers/formatters/formatConcentrationDelta'
import { formatPositionCount } from '@/domains/portfolio/features/diversification/features/concentration/helpers/formatters/formatPositionCount'
import i18n from '@/i18n/i18n'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
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
  const formatNumber = useFormatNumber()
  return (
    <div>
      <ChartText tone={tone}>{label}</ChartText> {formatPositionCount(value)}{' '}
      <Text tone="subtle">
        ·{' '}
        {value == null
          ? i18n.t(
              'ui.concentrationtrendsection.insufficientIdentifiedCoverage',
            )
          : formatConcentrationDelta(delta, formatNumber)}
      </Text>
    </div>
  )
}
