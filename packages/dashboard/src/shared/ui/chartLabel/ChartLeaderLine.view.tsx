import type { SVGProps } from 'react'

import { CHART_THEME } from '@/shared/theme/chartTheme'

export function ChartLeaderLine(
  props: Pick<SVGProps<SVGPolylineElement>, 'points'>,
) {
  return (
    <polyline
      {...props}
      fill="none"
      stroke={CHART_THEME.zeroLine}
      strokeWidth={0.75}
    />
  )
}
