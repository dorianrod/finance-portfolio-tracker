import { useFormatPieEntryLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatPieEntryLabel'
import type { PieEntry } from '@/domains/portfolio/shared/types/pieEntry.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import { type NumericTooltipProps } from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export function PieTooltip({ active, payload }: NumericTooltipProps<PieEntry>) {
  const formatLabel = useFormatPieEntryLabel()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  const item = payload[0]?.payload
  if (!item) return null
  const percentage = formatPercentage(
    item.total > 0 ? (item.value / item.total) * 100 : 0,
  )
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'} variant="strong">
          {formatLabel(item)}
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
