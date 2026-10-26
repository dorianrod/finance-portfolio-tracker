import type { ComponentProps } from 'react'
import { Sector } from 'recharts'

import { CHART_THEME } from '@/shared/theme/chartTheme'

import { resolveSeriesColor, type SeriesColor } from './chartSeriesColor'

type Geometry = Pick<
  ComponentProps<typeof Sector>,
  | 'cx'
  | 'cy'
  | 'innerRadius'
  | 'outerRadius'
  | 'startAngle'
  | 'endAngle'
  | 'cornerRadius'
  | 'forceCornerRadius'
  | 'cornerIsExternal'
>
type Props = Geometry &
  SeriesColor & {
    geometry?: Geometry
    selected?: boolean
    dimmed?: boolean
    variant?: 'standard' | 'splitBase' | 'splitOverlay'
  }
export function ChartSector({
  geometry,
  tone,
  category,
  group,
  selected = false,
  dimmed = false,
  variant = 'standard',
  ...props
}: Props) {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    cornerRadius,
    forceCornerRadius,
    cornerIsExternal,
  } = geometry ?? {}
  const split = variant !== 'standard'
  let state = {
    stroke: 'none',
    strokeWidth: 0,
    strokeOpacity: undefined as number | undefined,
  }
  if (selected)
    state = {
      stroke: CHART_THEME.label,
      strokeWidth: 2,
      strokeOpacity: undefined,
    }
  if (split)
    state = {
      stroke: 'var(--ds-surface)',
      strokeWidth: 0.5,
      strokeOpacity: 0.7,
    }
  const alpha = { standard: undefined, splitBase: 0.48, splitOverlay: 0.68 }[
    variant
  ]
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      cornerRadius={cornerRadius}
      forceCornerRadius={forceCornerRadius}
      cornerIsExternal={cornerIsExternal}
      {...props}
      fill={resolveSeriesColor({ tone, category, group })}
      opacity={dimmed ? 0.25 : 1}
      fillOpacity={alpha}
      {...state}
    />
  )
}
