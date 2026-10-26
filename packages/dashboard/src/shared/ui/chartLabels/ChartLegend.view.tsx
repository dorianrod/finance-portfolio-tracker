import type { ComponentProps } from 'react'
import { Legend } from 'recharts'

import { CHART_THEME } from '@/shared/theme/chartTheme'

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
