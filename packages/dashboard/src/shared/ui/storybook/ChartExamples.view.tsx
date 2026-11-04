import type { ReactNode } from 'react'
import {
  type BarShapeProps,
  ComposedChart,
  type DotProps,
  type PieLabelRenderProps,
  type PieSectorShapeProps,
  type ScatterShapeProps,
} from 'recharts'

import { getHashedSeriesTone } from '@/shared/theme/chartColors/getHashedSeriesTone'
import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import { ChartLabel } from '@/shared/ui/chartLabel/ChartLabel.view'
import { ChartSymbol } from '@/shared/ui/seriesScatter/ChartSymbol.view'

import { ChartMarker } from '../ChartMarker.view'
import { ChartRectangle } from '../ChartRectangle.view'
import { ChartSector } from '../ChartSector.view'
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
  geometry: Partial<Omit<BarShapeProps, 'className' | 'style'>>,
) {
  return <ChartRectangle geometry={geometry} />
}
export function PieShapeExample({
  selectedName,
  ...geometry
}: Partial<Omit<PieSectorShapeProps, 'className' | 'style'>> & {
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
}: Partial<Omit<PieLabelRenderProps, 'className' | 'style'>>) {
  return (
    <ChartLabel x={x} y={y} variant="pie">
      {name}
    </ChartLabel>
  )
}
export function ScatterShapeExample(
  geometry: Partial<Omit<ScatterShapeProps, 'className' | 'style'>>,
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
}: Partial<Omit<DotProps, 'className' | 'style'>>) {
  return <ChartMarker cx={cx} cy={cy} tone="series1" outline="series1Stroke" />
}
