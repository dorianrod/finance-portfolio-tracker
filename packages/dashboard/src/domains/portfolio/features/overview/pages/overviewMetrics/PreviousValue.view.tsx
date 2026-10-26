import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { Text } from '@/shared/ui/Text.view'

export function PreviousValue({
  value,
  suffix = '',
}: {
  value: number | null
  suffix?: string
}) {
  const formatMoney = useFormatMoney()
  return (
    <Text variant="micro" tone="subtle">
      {i18n.t('ui.overviewsummarycards.previous')}{' '}
      <Text variant="medium" tone="muted" numeric>
        {value == null
          ? i18n.t('ui.overviewsummarycards.unavailable')
          : `${formatMoney(value)}${suffix}`}
      </Text>
    </Text>
  )
}
