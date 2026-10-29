import type { AllocationTrendPoint } from '@/domains/portfolio/features/diversification/features/allocation/components/EvoCard/types/allocationTrend.type'
import { AllocationCategory } from '@/domains/portfolio/shared/components/AllocationCategory/AllocationCategory.view'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import type { NumericTooltipProps } from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

import type { AllocationTrendSeries } from './EvoCard/types/allocationTrendSeries.type'

export function EvolutionTooltip({
  active,
  payload,
  label,
  series,
}: EvolutionTooltipProps) {
  const formatDate = useFormatDate()
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'}>
          {formatDate(label, { style: 'longMonthYear', fallback: '' })}
        </ChartText>
      </Layout>
      {series.toReversed().map((item) => (
        <EvolutionTooltipRow
          key={item.index}
          series={item}
          point={payload[0]?.payload}
        />
      ))}
    </TooltipBox>
  )
}

type EvolutionTooltipRowProps = {
  series: AllocationTrendSeries
  point: AllocationTrendPoint | undefined
}

function EvolutionTooltipRow({ series, point }: EvolutionTooltipRowProps) {
  const formatPercentage = useFormatPercentage()
  const value = point?.values[series.index]
  const category = series.category
  if (value == null || value === 0) return null

  return (
    <AllocationCategory
      as="div"
      category={category.kind === 'category' ? category.name : ''}
      aggregate={category.kind === 'group'}
    >
      {series.label}: {formatPercentage(value)}
    </AllocationCategory>
  )
}

type EvolutionTooltipProps = NumericTooltipProps<AllocationTrendPoint> & {
  series: AllocationTrendSeries[]
}
