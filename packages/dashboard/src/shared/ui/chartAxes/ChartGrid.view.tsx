import type { ComponentProps } from 'react'
import { CartesianGrid } from 'recharts'

import { CHART_THEME } from '@/shared/theme/chartTheme'
import { CHART_GRID_PATTERNS } from '@/shared/ui/chartAppearance/chartGridPatterns'

export function ChartGrid({ pattern = 'dashed', ...props }: GridProps) {
  return (
    <CartesianGrid
      {...props}
      stroke={CHART_THEME.grid}
      strokeDasharray={CHART_GRID_PATTERNS[pattern]}
    />
  )
}

type GridConfigKeys =
  | 'horizontalPoints'
  | 'verticalPoints'
  | 'horizontalCoordinatesGenerator'
  | 'verticalCoordinatesGenerator'
  | 'x'
  | 'y'
  | 'width'
  | 'height'
  | 'syncWithTicks'
  | 'style'

type GridProps = Pick<ComponentProps<typeof CartesianGrid>, GridConfigKeys> & {
  pattern?: keyof typeof CHART_GRID_PATTERNS
  horizontal?: boolean
  vertical?: boolean
}
