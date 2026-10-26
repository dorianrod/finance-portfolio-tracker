import { getAllocationTone } from '@/domains/portfolio/shared/helpers/presenters/getPortfolioSeriesTone'
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
import { Layout } from '@/shared/ui/Layout.view'
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
    <Layout as="div" spaceBefore="compact">
      <ChartText as="div" tone={'tooltipDim'}>
        {subItem.name} — {formatMoney(subItem.value, { style: 'compact' })} ·{' '}
        {percentage}
      </ChartText>
    </Layout>
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
    <ChartText as="div" tone={getAllocationTone(category)}>
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
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'} variant="strong">
          {item.name}
        </ChartText>
      </Layout>
      <ChartText as="div" tone={'tooltipLabel'} variant="bold">
        {formatMoney(item.value, { style: 'full' })}
      </ChartText>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipDim'}>
          {i18n.t('ui.allocationchartsTooltips.ofTotalAllocatedWithValues', {
            percentage,
          })}
        </ChartText>
      </Layout>
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
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'}>
          {label == null ? '' : formatDate(label, { style: 'longMonthYear' })}
        </ChartText>
      </Layout>
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
