import type { ComponentProps } from 'react'
import { CartesianGrid, XAxis, YAxis } from 'recharts'

import { CHART_THEME } from '@/shared/theme/chartTheme'

import { CHART_AXIS_TICK, CHART_GRID_PATTERNS } from './chartAppearance'

type AxisConfigKeys =
  | 'dataKey'
  | 'type'
  | 'domain'
  | 'hide'
  | 'orientation'
  | 'mirror'
  | 'allowDataOverflow'
  | 'allowDecimals'
  | 'allowDuplicatedCategory'
  | 'interval'
  | 'minTickGap'
  | 'tickCount'
  | 'ticks'
  | 'tickFormatter'
  | 'tickMargin'
  | 'padding'
  | 'reversed'
  | 'scale'
  | 'includeHidden'
  | 'name'
  | 'unit'
  | 'className'
  | 'style'
  | 'children'

type XAxisConfig = Pick<
  ComponentProps<typeof XAxis>,
  Extract<
    keyof ComponentProps<typeof XAxis>,
    AxisConfigKeys | 'xAxisId' | 'height'
  >
>
type YAxisConfig = Pick<
  ComponentProps<typeof YAxis>,
  Extract<
    keyof ComponentProps<typeof YAxis>,
    AxisConfigKeys | 'yAxisId' | 'width'
  >
>

export function ChartXAxis({
  density = 'standard',
  axis = false,
  ...props
}: XAxisConfig & { density?: 'standard' | 'compact'; axis?: boolean }) {
  return (
    <XAxis
      {...props}
      tick={{ ...CHART_AXIS_TICK, fontSize: density === 'compact' ? 10 : 11 }}
      tickLine={false}
      axisLine={axis}
    />
  )
}

export function ChartYAxis({
  density = 'standard',
  axis = false,
  ...props
}: YAxisConfig & { density?: 'standard' | 'compact'; axis?: boolean }) {
  return (
    <YAxis
      {...props}
      tick={{ ...CHART_AXIS_TICK, fontSize: density === 'compact' ? 10 : 11 }}
      tickLine={false}
      axisLine={axis}
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
  | 'className'
  | 'style'
type GridProps = Pick<ComponentProps<typeof CartesianGrid>, GridConfigKeys> & {
  pattern?: keyof typeof CHART_GRID_PATTERNS
  horizontal?: boolean
  vertical?: boolean
}

export function ChartGrid({ pattern = 'dashed', ...props }: GridProps) {
  return (
    <CartesianGrid
      {...props}
      stroke={CHART_THEME.grid}
      strokeDasharray={CHART_GRID_PATTERNS[pattern]}
    />
  )
}
