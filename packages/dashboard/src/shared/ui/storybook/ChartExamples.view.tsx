import type { ReactNode } from 'react'
import {
  type BarShapeProps,
  ComposedChart,
  type DotProps,
  type PieLabelRenderProps,
  type PieSectorShapeProps,
  type ScatterShapeProps,
} from 'recharts'

import { ChartGrid, ChartXAxis, ChartYAxis } from '../ChartAxes.view'
import { ChartLabel } from '../ChartLabel.view'
import { ChartRectangle } from '../ChartRectangle.view'
import { ChartSector } from '../ChartSector.view'
import { ChartSymbol } from '../SeriesScatter.view'
import { TransactionMarker } from '../TransactionMarker.view'
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
export function BarShapeExample(geometry: Partial<BarShapeProps>) {
  return <ChartRectangle geometry={geometry} />
}
export function PieShapeExample({
  selectedName,
  ...geometry
}: Partial<PieSectorShapeProps> & { selectedName?: string; name?: string }) {
  return (
    <ChartSector
      geometry={geometry}
      category={geometry.name ?? 'Equity'}
      selected={selectedName === geometry.name}
    />
  )
}
export function PieLabelExample({ x, y, name }: Partial<PieLabelRenderProps>) {
  return (
    <ChartLabel x={x} y={y} variant="pie">
      {name}
    </ChartLabel>
  )
}
export function ScatterShapeExample(geometry: Partial<ScatterShapeProps>) {
  return (
    <ChartSymbol
      geometry={geometry}
      tone="returnRate"
      age={{ year: 2024, recent: false, oldestYear: 2020, newestYear: 2025 }}
    />
  )
}
export function TransactionDotExample({ cx, cy }: Partial<DotProps>) {
  return <TransactionMarker cx={cx} cy={cy} kind="buy" />
}
