import { getAllocationTone } from '@/domains/portfolio/shared/helpers/presenters/getPortfolioSeriesTone/getAllocationTone'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import {
  type NumericTooltipProps,
  tooltipValue,
} from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export function EvolutionTooltip({
  active,
  payload,
  label,
  categories,
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

type EvolutionTooltipRowProps = {
  category: string
  payload: NonNullable<
    NumericTooltipProps<Record<string, number | string>>['payload']
  >
}

function EvolutionTooltipRow({ category, payload }: EvolutionTooltipRowProps) {
  const formatPercentage = useFormatPercentage()
  const value = tooltipValue(payload, category)
  if (value === 0) return null

  return (
    <ChartText as="div" tone={getAllocationTone(category)}>
      {category}: {formatPercentage(value)}
    </ChartText>
  )
}

type EvolutionTooltipProps = NumericTooltipProps<
  Record<string, number | string>
> & {
  categories: string[]
}
