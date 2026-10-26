import type { ComponentProps, ReactNode } from 'react'
import { Scatter, type ScatterShapeProps } from 'recharts'

import { CHART_COLORS } from '@/shared/theme/chartColors/chartColors'
import type { ChartTone } from '@/shared/theme/chartColors/chartColors.types'
import { partitionChartSlot } from '@/shared/ui/chartSlots'

export function SeriesScatter({
  tone,
  children,
  ...props
}: Pick<ComponentProps<typeof Scatter>, Keys> & {
  tone: ChartTone
}) {
  const { renderer, content } = partitionChartSlot<
    Partial<Omit<ScatterShapeProps, 'className'>>
  >(children, SeriesScatterShape)
  return (
    <Scatter {...props} fill={CHART_COLORS[tone]} shape={renderer}>
      {content}
    </Scatter>
  )
}

type Keys = 'data' | 'dataKey' | 'name' | 'xAxisId' | 'yAxisId' | 'children'

function SeriesScatterShape({ children }: { children: ReactNode }) {
  return children
}

SeriesScatter.Shape = SeriesScatterShape
