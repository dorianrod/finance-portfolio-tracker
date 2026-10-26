import type { ComponentProps, ReactNode } from 'react'
import { Scatter, type ScatterShapeProps, Symbols } from 'recharts'

import {
  SEMANTIC_COLORS,
  type SemanticColorKey,
} from '@/shared/theme/semanticColors'

import { type ChartAge,chartAgeOpacity } from './chartAgeAppearance'
import { partitionChartSlot } from './chartSlots'

type Keys = 'data' | 'dataKey' | 'name' | 'xAxisId' | 'yAxisId' | 'children'
export function SeriesScatter({
  tone,
  children,
  ...props
}: Pick<ComponentProps<typeof Scatter>, Keys> & { tone: SemanticColorKey }) {
  const { renderer, content } = partitionChartSlot<Partial<ScatterShapeProps>>(
    children,
    SeriesScatterShape,
  )
  return (
    <Scatter {...props} fill={SEMANTIC_COLORS[tone]} shape={renderer}>
      {content}
    </Scatter>
  )
}
function SeriesScatterShape({ children }: { children: ReactNode }) {
  return children
}
SeriesScatter.Shape = SeriesScatterShape

export function ChartSymbol({
  geometry,
  tone,
  age,
}: {
  geometry: Pick<Partial<ScatterShapeProps>, 'cx' | 'cy' | 'size'>
  tone: SemanticColorKey
  age?: ChartAge
}) {
  return (
    <Symbols
      cx={geometry.cx}
      cy={geometry.cy}
      size={geometry.size}
      type="circle"
      fill={SEMANTIC_COLORS[tone]}
      fillOpacity={age && chartAgeOpacity(age)}
    />
  )
}
