import type { ReactNode } from 'react'
import {
  type BarShapeProps,
  ComposedChart,
  type DotProps,
  type PieLabelRenderProps,
  type PieSectorShapeProps,
  type ScatterShapeProps,
} from 'recharts'

import { getHashedSeriesTone } from '@/shared/theme/chartColors'

import { ChartGrid, ChartXAxis, ChartYAxis } from '../ChartAxes.view'
import { ChartLabel } from '../ChartLabel.view'
import { ChartMarker } from '../ChartMarker.view'
import { ChartRectangle } from '../ChartRectangle.view'
import { ChartSector } from '../ChartSector.view'
import { ChartSymbol } from '../SeriesScatter.view'
import { HISTORY } from './fixtures'

export function CartesianExample({ children }: { children: ReactNode }) {
  return (
    <ComposedChart
      width={560}
      height={300}
      data={HISTORY}
      margin={{ top: 24, right: 24, bottom: 12, left: 0 }}
    >
      <ChartGrid />
      <ChartXAxis dataKey="month" />
      <ChartYAxis />
      {children}
    </ComposedChart>
  )
}
export function BarShapeExample(
  geometry: Partial<Omit<BarShapeProps, 'className'>>,
) {
  return <ChartRectangle geometry={geometry} />
}
export function PieShapeExample({
  selectedName,
  ...geometry
}: Partial<Omit<PieSectorShapeProps, 'className'>> & {
  selectedName?: string
  name?: string
}) {
  return (
    <ChartSector
      geometry={geometry}
      tone={getHashedSeriesTone(geometry.name ?? 'Equity')}
      selected={selectedName === geometry.name}
    />
  )
}
export function PieLabelExample({
  x,
  y,
  name,
}: Partial<Omit<PieLabelRenderProps, 'className'>>) {
  return (
    <ChartLabel x={x} y={y} variant="pie">
      {name}
    </ChartLabel>
  )
}
export function ScatterShapeExample(
  geometry: Partial<Omit<ScatterShapeProps, 'className'>>,
) {
  return (
    <ChartSymbol
      geometry={geometry}
      tone={'series10'}
      age={{ year: 2024, recent: false, oldestYear: 2020, newestYear: 2025 }}
    />
  )
}
export function MarkerDotExample({
  cx,
  cy,
}: Partial<Omit<DotProps, 'className'>>) {
  return <ChartMarker cx={cx} cy={cy} tone="series1" outline="series1Stroke" />
}
