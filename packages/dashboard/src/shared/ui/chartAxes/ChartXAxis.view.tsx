import type { ComponentProps } from 'react'
import { XAxis } from 'recharts'

import { CHART_AXIS_TICK } from '@/shared/ui/chartAppearance/chartAxisTick'

import type { AxisConfigKeys } from './chartAxes.types'

export function ChartXAxis<T extends 'number' | 'category' = 'category'>({
  density = 'standard',
  axis = false,
  ...props
}: XAxisConfig<T> & { density?: 'standard' | 'compact'; axis?: boolean }) {
  return (
    <XAxis
      {...props}
      tick={{ ...CHART_AXIS_TICK, fontSize: density === 'compact' ? 10 : 11 }}
      tickLine={false}
      axisLine={axis}
    />
  )
}

type XAxisConfig<T extends 'number' | 'category'> = Omit<
  Pick<
    ComponentProps<typeof XAxis>,
    Extract<
      keyof ComponentProps<typeof XAxis>,
      AxisConfigKeys | 'xAxisId' | 'height'
    >
  >,
  'type' | 'tickFormatter'
> & {
  type?: T
  tickFormatter?: (
    value: T extends 'number' ? number : string | number,
    index: number,
  ) => string
}
