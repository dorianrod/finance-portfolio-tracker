import type { ComponentProps } from 'react'
import { ReferenceArea,ReferenceLine } from 'recharts'

import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'

import { REFERENCE_APPEARANCES } from './chartAppearance'

type ReferenceDataKeys =
  | 'x'
  | 'y'
  | 'segment'
  | 'xAxisId'
  | 'yAxisId'
  | 'ifOverflow'
  | 'position'
  | 'id'
  | 'className'
  | 'style'
type ChartReferenceProps = Pick<
  ComponentProps<typeof ReferenceLine>,
  Extract<keyof ComponentProps<typeof ReferenceLine>, ReferenceDataKeys>
> & {
  kind?: keyof typeof REFERENCE_APPEARANCES
}

export function ChartReference({
  kind = 'zero',
  ...props
}: ChartReferenceProps) {
  return <ReferenceLine {...props} {...REFERENCE_APPEARANCES[kind]} />
}

export function ChartReferenceArea({
  period,
  ...props
}: Pick<ComponentProps<typeof ReferenceArea>, 'x1' | 'x2' | 'y1' | 'y2'> & {
  period: 'previous' | 'current'
}) {
  return (
    <ReferenceArea
      {...props}
      fill={
        period === 'previous'
          ? SEMANTIC_COLORS.neutralSeries
          : SEMANTIC_COLORS.portfolioValue
      }
      fillOpacity={period === 'previous' ? 0.05 : 0.055}
    />
  )
}
