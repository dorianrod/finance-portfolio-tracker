import type { ComponentProps } from 'react'
import { LabelList } from 'recharts'

import { CHART_THEME } from '@/shared/theme/chartTheme'

export function ChartLabels<TPoint extends object>({
  density = 'compact',
  label,
  ...props
}: Pick<ComponentProps<typeof LabelList>, 'position' | 'offset'> & {
  density?: 'standard' | 'compact'
  label: (point: TPoint) => string
}) {
  return (
    <LabelList
      {...props}
      dataKey={label}
      style={{
        fill: CHART_THEME.label,
        fontSize: density === 'compact' ? 10 : 11,
      }}
    />
  )
}
