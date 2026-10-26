import type { ComponentProps } from 'react'
import { XAxis } from 'recharts'

import { CHART_AXIS_TICK } from '@/shared/ui/chartAppearance/chartAxisTick'

import type { AxisConfigKeys } from './chartAxes.types'

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

type XAxisConfig = Pick<
  ComponentProps<typeof XAxis>,
  Extract<
    keyof ComponentProps<typeof XAxis>,
    AxisConfigKeys | 'xAxisId' | 'height'
  >
>
