import type { ComponentProps } from 'react'
import { ReferenceArea, ReferenceLine } from 'recharts'

import { CHART_COLORS } from '@/shared/theme/chartColors'

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
  prominence,
  ...props
}: Pick<ComponentProps<typeof ReferenceArea>, 'x1' | 'x2' | 'y1' | 'y2'> & {
  prominence: 'muted' | 'highlighted'
}) {
  return (
    <ReferenceArea
      {...props}
      fill={
        prominence === 'muted' ? CHART_COLORS.neutral : CHART_COLORS.series6
      }
      fillOpacity={prominence === 'muted' ? 0.05 : 0.055}
    />
  )
}
