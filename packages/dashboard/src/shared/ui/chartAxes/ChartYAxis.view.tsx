import type { ComponentProps } from 'react'
import { YAxis } from 'recharts'

import { CHART_AXIS_TICK } from '@/shared/ui/chartAppearance/chartAxisTick'

import type { AxisConfigKeys } from './chartAxes.types'

export function ChartYAxis<T extends 'number' | 'category' = 'number'>({
  density = 'standard',
  axis = false,
  ...props
}: YAxisConfig<T> & { density?: 'standard' | 'compact'; axis?: boolean }) {
  return (
    <YAxis
      {...props}
      tick={{ ...CHART_AXIS_TICK, fontSize: density === 'compact' ? 10 : 11 }}
      tickLine={false}
      axisLine={axis}
    />
  )
}

type YAxisConfig<T extends 'number' | 'category'> = Omit<
  Pick<
    ComponentProps<typeof YAxis>,
    Extract<
      keyof ComponentProps<typeof YAxis>,
      AxisConfigKeys | 'yAxisId' | 'width'
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
