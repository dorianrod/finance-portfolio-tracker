import type { PieEntry } from '@/domains/portfolio/shared/types/allocationChart.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import {
  type NumericTooltipProps,
  tooltipValue,
} from '@/shared/ui/chartTooltip'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

function PieTooltipSubItem({
  item,
  subItem,
}: {
  item: PieEntry
  subItem: NonNullable<PieEntry['subItems']>[number]
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const percentage = formatPercentage(
    item.total > 0 ? (subItem.value / item.total) * 100 : 0,
  )

  return (
    <ChartText as="div" tone={'tooltipDim'} style={{ marginTop: 2 }}>
      {subItem.name} — {formatMoney(subItem.value, { style: 'compact' })} ·{' '}
      {percentage}
    </ChartText>
  )
}

type EvolutionTooltipRowProps = {
  category: string
  payload: NonNullable<
    NumericTooltipProps<Record<string, number | string>>['payload']
  >
}

function EvolutionTooltipRow({ category, payload }: EvolutionTooltipRowProps) {
  const formatPercentage = useFormatPercentage()
  const value = tooltipValue(payload, category)
  if (!value) return null

  return (
    <ChartText as="div" category={category}>
      {category}: {formatPercentage(value)}
    </ChartText>
  )
}

export function PieTooltip({ active, payload }: NumericTooltipProps<PieEntry>) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const item = payload[0]?.payload
  if (!item) return null
  const percentage = formatPercentage(
    item.total > 0 ? (item.value / item.total) * 100 : 0,
  )
  return (
    <TooltipBox minWidth={160}>
      <ChartText
        as="div"
        tone={'tooltipText'}
        variant="strong"
        style={{ marginBottom: 4 }}
      >
        {item.name}
      </ChartText>
      <ChartText as="div" tone={'tooltipLabel'} variant="bold">
        {formatMoney(item.value, { style: 'full' })}
      </ChartText>
      <ChartText
        as="div"
        tone={'tooltipDim'}
        style={{ marginBottom: item.subItems?.length ? 6 : 0 }}
      >
        {i18n.t('ui.allocationchartsTooltips.ofTotalAllocatedWithValues', {
          percentage,
        })}
      </ChartText>
      {item.subItems?.map((subItem) => (
        <PieTooltipSubItem key={subItem.name} item={item} subItem={subItem} />
      ))}
    </TooltipBox>
  )
}

type EvolutionTooltipProps = NumericTooltipProps<
  Record<string, number | string>
> & {
  categories: string[]
}

export function EvolutionTooltip({
  active,
  payload,
  label,
  categories,
}: EvolutionTooltipProps) {
  const formatDate = useFormatDate()
  if (!active || !payload?.length) return null
  return (
    <TooltipBox maxWidth={220}>
      <ChartText as="div" tone={'tooltipText'} style={{ marginBottom: 6 }}>
        {label == null ? '' : formatDate(label, { style: 'longMonthYear' })}
      </ChartText>
      {categories.toReversed().map((category) => (
        <EvolutionTooltipRow
          key={category}
          category={category}
          payload={payload}
        />
      ))}
    </TooltipBox>
  )
}
