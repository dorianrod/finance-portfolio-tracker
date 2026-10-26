import type { ComponentProps, ReactNode } from 'react'
import { Scatter, type ScatterShapeProps, Symbols } from 'recharts'

import { CHART_COLORS, type ChartTone } from '@/shared/theme/chartColors'

import { type ChartAge, chartAgeOpacity } from './chartAgeAppearance'
import { partitionChartSlot } from './chartSlots'

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

export function ChartSymbol({
  geometry,
  tone,
  age,
}: {
  geometry: Pick<Partial<ScatterShapeProps>, 'cx' | 'cy' | 'size'>
  tone: ChartTone
  age?: ChartAge
}) {
  return (
    <Symbols
      cx={geometry.cx}
      cy={geometry.cy}
      size={geometry.size}
      type="circle"
      fill={CHART_COLORS[tone]}
      fillOpacity={age && chartAgeOpacity(age)}
    />
  )
}

type Keys = 'data' | 'dataKey' | 'name' | 'xAxisId' | 'yAxisId' | 'children'
function SeriesScatterShape({ children }: { children: ReactNode }) {
  return children
}
SeriesScatter.Shape = SeriesScatterShape
