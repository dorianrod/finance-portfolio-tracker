import type { ComponentProps } from 'react'
import { LabelList, Legend } from 'recharts'

import { CHART_THEME } from '@/shared/theme/chartTheme'

export function ChartLabels({
  density = 'compact',
  ...props
}: Pick<ComponentProps<typeof LabelList>, LabelKeys> & {
  density?: 'standard' | 'compact'
}) {
  return (
    <LabelList
      {...props}
      style={{
        fill: CHART_THEME.label,
        fontSize: density === 'compact' ? 10 : 11,
      }}
    />
  )
}

export function ChartLegend(
  props: Pick<
    ComponentProps<typeof Legend>,
    'height' | 'layout' | 'align' | 'verticalAlign'
  >,
) {
  return (
    <Legend
      {...props}
      wrapperStyle={{ fontSize: 11, color: CHART_THEME.tick }}
    />
  )
}

type LabelKeys =
  'dataKey' | 'position' | 'offset' | 'formatter' | 'valueAccessor'
