import type { ComponentProps } from 'react'
import { ReferenceArea } from 'recharts'

import { CHART_COLORS } from '@/shared/theme/chartColors/chartColors'

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
