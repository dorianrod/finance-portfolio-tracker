import type { ComponentProps } from 'react'
import { LabelList } from 'recharts'

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

type LabelKeys =
  'dataKey' | 'position' | 'offset' | 'formatter' | 'valueAccessor'
